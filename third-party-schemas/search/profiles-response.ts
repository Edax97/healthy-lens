// To parse this data:
//
//   import { Convert, UserProfile } from "./file";
//
//   const userProfile = Convert.toUserProfile(json);

export interface ProfilesResponse {
    actors: Actor[];
    cursor: string;
}

export interface Actor {
    did: string;
    handle: string;
    displayName: string;
    avatar: string;
    labels: any[];
    createdAt: string;
    description: string;
    indexedAt: string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static JSONtoProfileList(json: string): ProfilesResponse {
        return JSON.parse(json);
    }

    public static userProfileToJson(value: ProfilesResponse): string {
        return JSON.stringify(value);
    }
}
