import {PromptTemplate} from "@langchain/core/prompts";
import {memoryStore, vertexAI} from "./index-source";
import { api } from "encore.dev/api";

export const template: string =`
    SYSTEM: You're an expert assistant that checks the veracity of medical claims.
    
    Claim: {claim}

    - Strictly Use UP TO THREE of the following pieces of context as references to give a veredict about the claim prompted at the end. 
    - Be specially careful with exaggerated affirmations. 
    - Succintly explain your veredict based on the information provided and cite the references. 
    - Label the claim as 'verified', 'questionable', 'dubious', or 'debunked'.
    - Also report the quality of the analysis you made based on the context in a scale to 100. 
    Do not try to make up an answer:
    - If the answer to the question cannot be determined from the context alone (say a evaluation quality
    bellow {minQuality}), answer that you could not retrieve enough information to decide if the claim raised is verified.
    - If the context is empty, just give the same answer as above.
    
    Answer in the manner of the following template:
    Claim: "This is a controversial one folks! Research has found clowns and stage artists
     are more likely to suffer from mental illnesses like schyzofrenia"
    Assessment: "#claim(Just repeat the claim unless its lenght overcome thee threshold of {maxLenght} 
                 characters, in which case give a faithfull summary up that lenght and follow
                 it by three dots inside brackets(...)"
                 #label("debunked")
                 #assessment("This is a highly unverifiable claim, as [1] points out clowns are 
                        not more likely to suffer from psychological afflictions than the general public.
                        Further research suggest consensus on the matter.
                        ")
                  #quality(95)
    
    =============
    {context}
    =============

    Claim: {claim}
    Assessment:
    `;
export const prompt = new PromptTemplate({inputVariables: ['claim', 'minQuality', 'maxLenght', 'context'], template});

export const agentEvaluate = async (claim: string, topic: string) => {
    const retrievedDocs = await memoryStore.similaritySearch(claim);
    const docsContent = retrievedDocs.map((doc) => doc.pageContent).join("\n");
    const messages = await prompt.invoke({
        claim,
        minQuality: 40,
        maxLenght: 200,
        context: docsContent,
    });
    const content = (await vertexAI.invoke(messages)).content;
    return content as string;
};
interface question{
    prompt: string;
}
interface response{
    assesment: string;
}
export const ask = api<question, response>(
    {path: '/evaluate/ask', method: 'GET', expose: true},
    async ({prompt}) => {
        const content = (await vertexAI.invoke(prompt)).content;
        if (!content) return {assesment: ''}
        const assesment = content as string;
        return {assesment};
    }
)