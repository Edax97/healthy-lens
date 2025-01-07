import {Document} from "@langchain/core/documents";
import {ChatVertexAI, VertexAIEmbeddings} from "@langchain/google-vertexai";
import {fromURL} from "cheerio";
import {config} from "dotenv";
import {api} from "encore.dev/api";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
interface DocMetadata {
    source: string;
}
//const project = 'health-knowledge-evaluation';
//const location = 'us-central1';

config();

/**
 * text model
 */
const textModel =  'gemini-1.5-flash';
export const vertexAI = new ChatVertexAI({model: textModel, temperature: 0});

/**
 * vector store for indexing of sources
 */
export const embeddings = new VertexAIEmbeddings({
    model: 'text-embedding-004'
})
export const memoryStore = new MemoryVectorStore(embeddings);


const spliceSources = async (sources: string[]) => {
    const docSources: Document<DocMetadata>[] = []
    for (const source of sources) {
        const resp = await fetch(source);
        const content = await resp.text()
        if (content !== null) docSources.push({
            pageContent: content,
            metadata: {'source': source},
        });
    }
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100
    });
    const sourcesSplits = await splitter.splitDocuments(docSources);
    return {sourcesSplits};
}
/**
 * Will index source documents for context retrieval
 * @vectorStore memoryStore
 */
export const indexSources = api(
    {path: '/evaluate/index', method: 'PATCH', expose: true},
    async () => {
        /**
         * Knowledge sources
         */
        const sourcesUri = [
            'https://positivepsychology.com/non-sleep-deep-rest-nsdr/',
            'https://pubmed.ncbi.nlm.nih.gov/10487717/'
        ]
        //try {
            const { sourcesSplits } = await spliceSources(sourcesUri);
            await memoryStore.addDocuments(sourcesSplits);
        /*} catch (error) {
            throw new APIError(ErrCode.Internal, 'Failed to index sources');
        }*/
        return {status: 200, statusText: 'Corpus indexed'};
    }
)
