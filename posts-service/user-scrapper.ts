import {api, APIError, ErrCode} from "encore.dev/api";
import {ParseActor} from "../third-party-schemas/post-scrapper/actor";
import {Feed, ParseFeed} from "../third-party-schemas/post-scrapper/feed";

export interface Userpage {
    userName: string;
    url: string;
    timeLine: '1m' | '3m' | '6m' | '1y' | '5y';
}
export interface Post {
   date: string;
   body: string;
}

const feedUrl = (actor: string, limit: number) => `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${actor}&limit=${limit}&filter=posts_no_replies`;
const actorUrl = (handle: string) => `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`;
export const scrapFeed = api<Userpage, Feed>(
    {path: '/posts/feed', method: 'GET', expose: false},
    async ({userName}) => {
        const actorRes = await fetch(actorUrl(userName));
        const actor = ParseActor.toActor(await actorRes.text())
        const feedRes = await fetch(feedUrl(actor.did, 100));
        return ParseFeed.toFeed(await feedRes.text());
    }
)
export const fetchPosts = api<Userpage, {feed: Post[]}>(
    {path: '/posts', method: 'POST', expose: true},
    async (user) => {
        const {feed: posts} = await scrapFeed(user);
        if (!posts) throw new APIError(ErrCode.NotFound, 'Could not find user');
        const feed = posts.map(({post: {record}}) => {
            return {
                body: record.text,
                date: record.createdAt
            }
        });
        return {feed};
    }
)