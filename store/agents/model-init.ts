import {DocumentInput} from "@langchain/core/documents";
import {Annotation, StateGraph} from "@langchain/langgraph";
import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {PineconeStore} from "@langchain/pinecone";
import {Pinecone} from "@pinecone-database/pinecone";
import {config} from "dotenv";
import {prompt} from "./prompt-template";

config();
const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_KEY,
    model: "text-embedding-3-small",
    batchSize: 2048
});
const pine = new Pinecone();
const pineconeIndex = pine.Index(process.env.PINECONE_INDEX!);
export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 6
})

/**
 * text model
 */
export const openAI = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
    maxTokens: undefined,
    apiKey: process.env.OPENAI_KEY
});

const InputState = Annotation.Root({
    query: Annotation<string>
})
const GenerateState = Annotation.Root({
    query: Annotation<string>,
    context: Annotation<DocumentInput[]>
});
const OutputState = Annotation.Root({
    query: Annotation<string>,
    context: Annotation<DocumentInput[]>,
    sources: Annotation<string[]>,
    answer: Annotation<string>
})
const provideContext = async (state: typeof InputState.State) => {
    const contextDocs = await vectorStore.similaritySearchWithScore(state.query, 5);
    const context = contextDocs.filter(([_, score]) => score > 0.1)
        .map(([doc, _]) => doc);
    return {context};
}

const generateOutput = async (state: typeof GenerateState.State) => {
    const docsContent = state.context.map(doc =>
        `-Document: ${doc.pageContent}`).join("\n");
    const query = (await prompt.invoke({
        claim: state.query,
        context: docsContent
    }));
    const resp = await openAI.invoke(query);
    const answer = (resp.content as string);
    if (!answer) return {};
    return {answer, sources: state.context.map(doc => doc.id)};
}
export const graph = new StateGraph(OutputState)
    .addNode("retrieve", provideContext)
    .addNode("generate", generateOutput)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", "__end__")
    .compile()