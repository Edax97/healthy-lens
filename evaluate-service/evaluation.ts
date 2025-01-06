import {api} from "encore.dev/api";
import {Claim, mapClaims} from "../posts-service/claim";
import {Userpage} from "../posts-service/user-scrapper";

interface GetEvalArgs{
    user: string;
}
interface EvalClaim{
    claim: string;
    topic: string;
    date: string;
    label: 'Verified' | 'Questionable' | 'Dubious' | 'Debunked' | 'Undecided';
    assessment: string;
    evalQuality?: number;
    score?: 'A+' | 'B' | 'C';
}
interface GetEvalRes{
    evaluatedClaims: EvalClaim[];
}

async function searchUser(user: string) {
    const userPage: Userpage = {
        userName: user,
        url: '',
        timeLine: "1m"
    }
    return userPage;
}

export const getEval = api<GetEvalArgs, GetEvalRes>(
    { path: '/evaluate/claims', method: 'POST', expose: true },
    async ({user}) => {
        const userPage = await searchUser(user);
        const {claims} = await mapClaims(userPage);
        const evaluatedClaims: EvalClaim[] = claims.map(claim => {
            return {
                claim: claim.affirmation,
                topic: claim.topic,
                date: claim.date,
                label: 'Verified',
                assessment: 'Its correct, as Its said in [1] and [2]',
                evalQuality: 85,
                score: 'A+'
            }
        });
        return {evaluatedClaims};
    }
)