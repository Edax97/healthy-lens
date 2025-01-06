// To parse this data:
//
//   import { Convert, Feed } from "./file";
//
//   const feed = Convert.toFeed(json);

export interface Feed {
    feed: FeedElement[];
}

export interface FeedElement {
    post: Post;
}

export interface Post {
    uri:         string;
    cid:         string;
    author:      Author;
    record:      Record;
    replyCount:  number;
    repostCount: number;
    likeCount:   number;
    quoteCount:  number;
    indexedAt:   string;
    labels:      any[];
}

export interface Author {
    did:         string;
    handle:      string;
    displayName: string;
    avatar:      string;
    labels:      any[];
    createdAt:   string;
}

export interface Record {
    $type:     string;
    createdAt: string;
    facets:    any[];
    langs:     string[];
    text:      string;
}

// Converts JSON strings to/from your types
export class ParseFeed {
    public static toFeed(json: string): Feed {
        return JSON.parse(json);
    }

    public static feedToJson(value: Feed): string {
        return JSON.stringify(value);
    }
}
