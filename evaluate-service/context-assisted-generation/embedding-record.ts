import {OpenAIEmbeddings} from "@langchain/openai";
import {PineconeStore} from "@langchain/pinecone";
import {Pinecone} from "@pinecone-database/pinecone";
import {parseXMLtoDocument} from "./parse-xml";
import {api} from "encore.dev/api";

interface Record {
    id: string;
    pageContent: string;
    metadata: {
        source: string; //to reference
        topic: string; //journal-title, to speed up retrieval
        keywords: string;
        title: string;
    };
}

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    batchSize: 2048
});

const pine = new Pinecone();
const pineconeIndex = pine.Index(process.env.PINECONE_INDEX!);
const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 6
})

const dir = process.env.DIR_PATH;

async function getBatch(dir: string | undefined, start: number, n: number) {
    if (!dir) return null;
    const batch: Record[] = [];
    for (let i = start; i <= start + n; i++) {
        const filePath = `${dir}${3000000 + i}.xml`; // Update this to the actual file path logic // Update this to the actual file path logic
        const fileData = await parseXMLtoDocument(filePath);
        if (!fileData) continue;
        const record: Record = {
            id: fileData.id,
            pageContent: fileData.title.concat(fileData.abstract),
            metadata: {
                source: fileData.id,
                keywords: fileData.keywords,
                topic: fileData.journal,
                title: fileData.journal,
            },
        };
        batch.push(record);
    }
    return batch;
}

const streamBatches = async (start: number, end: number, size: number) => {
    try {
        for (let i = start; i <= end + 1; i = i + size) {
            const batch = await getBatch(dir, i, i + size);
            if (!batch) continue;

            await vectorStore.addDocuments(batch);
            console.log("yay", i);
        }
    } catch (error) {
        console.error(error);
    }
};

interface StreamFilesSettings {
    start: number;
    end: number;
    size: number;
}

export const streamRecords = api<StreamFilesSettings, void>(
    {expose: true, method: "GET", path: "/records"},
    async ({start, end, size}) => {
        await streamBatches(start, end, size);
    },
);
