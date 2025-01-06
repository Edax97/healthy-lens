import {Document} from "@langchain/core/documents";
import {ChatVertexAI, VertexAIEmbeddings} from "@langchain/google-vertexai";
import {fromURL} from "cheerio";
import {APIError, ErrCode} from "encore.dev/api";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {api} from "../../../../.encore/runtimes/js/encore.dev/api/mod";
interface DocMetadata {
    source: string;
}
export const llm = new ChatVertexAI({
    model: 'text-bison@002',
    temperature: 0
});
export const embeddings = new VertexAIEmbeddings({
    model: 'textembedding-gecko003'
})
export const memoryStore = new MemoryVectorStore(embeddings);
/**
 * Knowledge sources
 */
const sourcesUri = [
    'https://positivepsychology.com/non-sleep-deep-rest-nsdr/',
    'https://pubmed.ncbi.nlm.nih.gov/10487717/'
]
const spliceSources = async (sources: string[]) => {
    const docSources: Document<DocMetadata>[] = []
    for (const source of sources) {
        const $ = await fromURL(source);
        const content = $('root').prop('innerText');
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
    {path: 'evaluate/index', method: 'PATCH', expose: true},
    async () => {
        try {
            const { sourcesSplits } = await spliceSources(sourcesUri);
            await memoryStore.addDocuments(sourcesSplits);
        } catch (error) {
            throw new APIError(ErrCode.Internal, 'Failed to index sources');
        }
        return {status: 200, statusText: 'Corpus indexed'};
    }
)