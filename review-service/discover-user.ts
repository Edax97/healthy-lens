import {api} from "encore.dev/api";
import {calculateAverageValidation, findTopTopics} from "./user-stats";
import {fetchPublications} from "~encore/internal/clients/post/endpoints";
import {searchUserData} from "~encore/internal/clients/search/endpoints";
import {PostReviewed, UserReviewed} from "../store/data-schema";
import {ProfilePostsResponse} from "../store/post";
import {reviewAllPosts} from "./review-post";

interface DiscoverParams {
    searchTerm: string;
    time: '1m' | '3m' | '6m' | '1y' | 'All';
}

export const discoverUser = api<DiscoverParams, ProfilePostsResponse>(
    {path: '/discover-user', method: 'GET', expose: true},
    async ({searchTerm, time}) => {
        /*relate search term to posts, and profile data*/
        const {did, ...userProps} = await searchUserData({searchTerm});
        const {feed} = await fetchPublications({did, time});

        /* review all posts in batches invoking openai chat models */
        const postsReviews = await reviewAllPosts(feed, 10);
        const posts: PostReviewed[] = postsReviews.map(((review, j) => {
            const {references, id, ...rest} = review;
            const {url, body: content, date} = feed[review.id];
            return ({
                user_did: did,
                referencesJSON: JSON.stringify(references),
                url,
                content,
                date,
                ...rest
            })
        }));
        /* infer user average reliability (from posts' validation score) and topic list*/
        const reliability = calculateAverageValidation(posts);
        const last_scanned = new Date().toISOString();
        const topic_list = findTopTopics(posts);
        const user: UserReviewed = {reliability, last_scanned, topic_list, did, ...userProps};

        /* Insert records associated with influencer in database */
        //insertUser(user)
        //insertPost(posts)
        return {user, posts};
    }
)

