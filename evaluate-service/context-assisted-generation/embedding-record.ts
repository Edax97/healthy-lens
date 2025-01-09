import { GoogleCloudStorageDocstore } from "@langchain/community/stores/doc/gcs";
import { MatchingEngine } from "@langchain/community/vectorstores/googlevertexai";
import { SyntheticEmbeddings } from "@langchain/core/utils/testing";
import { parseXMLtoDocument } from "./parse-xml";
import { Readable, Writable } from "stream";
import { pipeline } from "stream/promises";
import { api } from "encore.dev/api";

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

const API_ENDPOINT = "283623269.us-west1-669513239525.vdb.vertexai.goog";
const INDEX_ENDPOINT =
  "projects/669513239525/locations/us-west1/indexEndpoints/3269358242773336064";
const DEPLOYED_INDEX_ID = "hkw_index_1736395795542";

const starterEmbeddings = new SyntheticEmbeddings({ vectorSize: 768 });
const gstorage = new GoogleCloudStorageDocstore({
  bucket: process.env.GCLOUD_STORAGE_BUCKET!,
});
const vectorIndex = new MatchingEngine(starterEmbeddings, {
  index: process.env.VERTEXAI_INDEX_ID!,
  indexEndpoint: process.env.VERTEXAI_INDEX_ENDPOINT_ID!,
  apiEndpoint: API_ENDPOINT,
  endpoint: INDEX_ENDPOINT,
  deployedIndexId: DEPLOYED_INDEX_ID,
  apiVersion: "v1",
  docstore: gstorage,
});
//console.log("PUBLIC ENDPOINT", await vectorIndex.determinePublicAPIEndpoint());
const dir = process.env.DIR_PATH;
const start = parseInt(process.env.START || "0");
const end = parseInt(process.env.END || "0");
const size = 1000;

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
    console.log("batch:", start);
    batch.push(record);
  }
  return batch;
}

const streamBatches = async () => {
  try {
    for (let i = start; i <= end + 1; i = i + size) {
      const batch = await getBatch(dir, i, i + size);
      if (!batch) continue;
      await vectorIndex.addDocuments(batch);
    }
  } catch (error) {
    console.error(error);
  }
};

export const streamRecords = api(
  { expose: true, method: "GET", path: "/records" },
  async () => {
    await streamBatches();
  },
);
