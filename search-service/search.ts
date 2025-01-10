import {api, APIError, ErrCode} from "encore.dev/api";
import {
    Actor,
    Convert
} from "../third-party-schemas/search/profiles-response";

interface SearchTerm {
    searchTerm: string;
}

export interface UserData {
    handle: string;
    name: string;
    did: string;
    avatar: string;
}

async function getUserProfile(sterm: string): Promise<Actor | null> {
    const resp = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActors?q="${sterm}"&limit=3`,
    );
    const {actors} = Convert.JSONtoProfileList(await resp.text());
    if (!actors) return null;
    return actors[0] || null;
}

/**
 * fetches user information using the site public api
 * @param searchterm
 * @return UserData
 */
export const searchUserData = api<SearchTerm, UserData>(
    {path: "/search-service", method: "GET", expose: true},
    async ({searchTerm}) => {
        const actor = await getUserProfile(searchTerm);
        if (!actor) throw new APIError(ErrCode.NotFound, "Could not find user!");
        return {
            handle: actor.handle,
            name: actor.displayName,
            did: actor.did,
            avatar: actor.avatar,
        };
    },
);
