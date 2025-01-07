import { api } from "encore.dev/api";
import {mapClaims} from "../posts-service/claim";
import {Userpage} from "../posts-service/user-scrapper";
import {agentEvaluate} from "./agent-pipechain";

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
        const evaluatedClaims: EvalClaim[] = [];
        for (const {affirmation, topic, date} of claims) {
            const agentAnswer = await agentEvaluate(affirmation, topic);
            evaluatedClaims.push({
                claim: affirmation,
                topic,
                date,
                label: 'Verified',
                assessment: agentAnswer,
                evalQuality: 85,
                score: 'A+'
            })
        }
        return {evaluatedClaims};
    }
)
