/*
* Records requested
*/
export interface UserReviewed {
    did: string;
    handle: string;
    name: string;
    avatar: string;
    reliability: number;
    topic_list: string;
    last_scanned: string;
}

export interface PostReviewed {
    user_did: string;
    url: string;
    content: string;
    topic: string;
    date: string;
    validation: number;
    summary: string;
    detailed_review: string;
    referencesJSON: string;
}