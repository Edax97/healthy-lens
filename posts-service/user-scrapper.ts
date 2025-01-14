import {api, APIError, ErrCode} from "encore.dev/api";
import {Feed, ParseFeed} from "../third-party-schemas/post-scrapper/feed";

export interface PostSearchParams {
    did: string;
    time: '1m' | '3m' | '6m' | '1y' | 'All';
}

export interface Post {
    date: string;
    body: string;
    url: string;
}

const feedUrl = (actor: string, limit: number) => `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${actor}&limit=${limit}&filter=posts_no_replies`;
export const scrapFeed = api<PostSearchParams, Feed>(
    {path: '/posts/feed', method: 'GET', expose: true},
    async ({did}) => {
        const feedRes = await fetch(feedUrl(did, 20));
        return ParseFeed.toFeed(await feedRes.text());
    }
)
export const fetchPublications = api<PostSearchParams, { feed: Post[] }>(
    {path: '/posts', method: 'POST', expose: true},
    async (user) => {
        const {feed: posts} = await scrapFeed(user);
        if (!posts) throw new APIError(ErrCode.NotFound, 'Could not find user');
        const feed = posts.map(({post}) => {
            const {record} = post;
            return {
                body: record.text,
                date: record.createdAt,
                url: post.uri
            }
        });
        return {feed};
    }
)