import {api, APIError, ErrCode} from "encore.dev/api";
import resolveIterator from "../sql-resolvers/resolve-iterator";
import {db} from "./profile";
import {PostReviewed, UserReviewed} from "./data-schema";

export interface SearchPostsParams {
    did_handle: string;
}

interface PostsResponse {
    posts: PostReviewed[];
}

interface UserPostJoin extends UserReviewed, PostReviewed {}

export interface ProfilePostsResponse {
    user: UserReviewed;
    posts: PostReviewed[];
}

export const fetchPosts = api<SearchPostsParams, PostsResponse>(
    {path: '/list_posts', method: 'GET', expose: true},
    async ({did_handle}) => {
        const response = await db.query<PostReviewed>`
            SELECT *
            FROM post_reviewed
            WHERE user_did = '${did_handle}';
        `;
        const posts = await resolveIterator(response);
        return {posts};
    }
);
export const fetchProfilePosts = api<SearchPostsParams, ProfilePostsResponse>(
    {path: '/profile_posts', method: 'GET', expose: true},
    async ({did_handle}) => {
        const response = await db.query<UserPostJoin>`
            SELECT u.*, p.*
            FROM user_reviewed u
                     LEFT JOIN post_reviewed p
                               ON u.did = p.user_did
            WHERE u.did = '${did_handle}'
        `;
        const userPosts = await resolveIterator(response);
        if (userPosts.length == 0 || !userPosts) throw new APIError(ErrCode.NotFound, `User doesn't exist`);
        const {did, handle, name, avatar, reliability, topic_list, last_scanned} = userPosts[0];
        const user = {
            did,
            handle,
            name,
            avatar,
            reliability,
            topic_list,
            last_scanned
        };
        const posts = userPosts
            .map(u_p => {
                const {
                    did, handle, name, avatar, reliability, topic_list, last_scanned,
                    ...p
                } = u_p;
                return p;
            })
        return {user, posts};
    }
)