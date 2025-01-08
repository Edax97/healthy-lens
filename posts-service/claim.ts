import { api } from "encore.dev/api";
import { fetchPosts, Post, Userpage } from "./user-scrapper";

export interface Claim {
  affirmation: string;
  topic: string;
  value: string;
  factor: string;
  kind: string;
  date: string;
  isVerifiable?: boolean;
}

interface mapRes {
  claims: Claim[];
}

/**
 * Endpoint to map user to a list of claims
 * @param user
 * @return Claim[]
 * todo: filter post to claim /posts/2/filter/
 */
export const mapClaims = api<Userpage, mapRes>(
  { path: "/posts/claims", method: "POST", expose: true },
  async (user) => {
    const { feed: posts } = await fetchPosts(user);
    const claims: Claim[] = [];
    for (const post of posts) {
      const claim = await parseClaim(post);
      if (claim && claim.isVerifiable === undefined) {
        claims.push(claim);
      }
    }
    return { claims };
  },
);

function extractMeta(mssg: string, tags: RegExp[]) {
  return tags.map((tag) => {
    let extracted = mssg.match(tag);
    if (!extracted) return "";
    return extracted[0].split(".")[1];
  });
}

const parseClaim = async (post: Post): Promise<Claim> => {
  const date = post.date;
  const affirmation = post.body;
  const [topic, value, factor, kind] = extractMeta(post.body, [
    /#topic.\S+/,
    /#value.\S+/,
    /#factor.\S+/,
    /#kind.\S+/,
  ]);
  return { affirmation, topic, value, factor, kind, date: date };
};
