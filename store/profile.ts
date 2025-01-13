import {api} from "encore.dev/api";
import {SQLDatabase} from "encore.dev/storage/sqldb";
import resolveIterator from "../sql-resolvers/resolve-iterator";
import {UserReviewed} from "./data-schema";

interface UsersRequested {
    top_number: number;
}

interface UsersResponse {
    users: UserReviewed[];
}

export const fetchProfiles = api<UsersRequested, UsersResponse>(
    {path: '/profile/collection', method: 'GET', expose: true},
    async ({top_number}) => {
        const usersRows = await db.query<UserReviewed>`
            SELECT *
            FROM user_reviewed
            LIMIT ${top_number}`;
        const users = await resolveIterator<UserReviewed>(usersRows);
        return ({users});
    }
);

export const db = new SQLDatabase('medical-review', {
    migrations: './migrations'
});