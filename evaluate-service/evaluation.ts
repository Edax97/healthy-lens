import { api } from "encore.dev/api";
import { mapClaims } from "../posts-service/claim";
import { Userpage } from "../posts-service/user-scrapper";
import { agentEvaluate } from "./agent-pipechain";

interface User {
  user: string;
}

interface Evaluation {
  claim: string;
  topic: string;
  date: string;
  label: "Verified" | "Questionable" | "Dubious" | "Debunked" | "Undecided";
  assessment: string;
  evalQuality?: number;
  score?: "A+" | "B" | "C";
}

interface Evaluations {
  evaluatedClaims: Evaluation[];
}

async function searchUser(user: string) {
  const userPage: Userpage = {
    userName: user,
    url: "",
    timeLine: "1m",
  };
  return userPage;
}

/**
 * Endpoint to request evaluation of a user' content
 * @param user
 * @return Evaluations
 * TODO: Retrieve user's page search/2
 */
export const evaluateUser = api<User, Evaluations>(
  { path: "/evaluate/claims", method: "POST", expose: true },
  async ({ user }) => {
    const userPage = await searchUser(user);
    const { claims } = await mapClaims(userPage);
    const evaluatedClaims: Evaluation[] = [];
    for (const { affirmation, topic, date } of claims) {
      const agentAnswer = await agentEvaluate(affirmation, topic);
      evaluatedClaims.push({
        claim: affirmation,
        topic,
        date,
        label: "Verified",
        assessment: agentAnswer,
        evalQuality: 85,
        score: "A+",
      });
    }
    return { evaluatedClaims };
  },
);
