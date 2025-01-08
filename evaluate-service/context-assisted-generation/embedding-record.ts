const { transform } = require("camaro");
import { MatchingEngine } from "@langchain/community/vectorstores/googlevertexai";
import fs from "fs";

interface DocumentMetadata {
  id: string;
  keywords: string[];
  journal: string;
  title: string;
  abstract: string;
}

interface Record {
  id: number;
  pageContents: string;
  metadata: {
    source: string; //to reference
    topic: string; //journal-title, to speed up retrieval
    keywords: string;
    title: string;
    abstract: string;
    embedded?: any; //tittle+embedded
  };
}

const template = {
  keywords: `/collection/document/passage[1]/infon[@key='kwd']`,
  journal: `/collection/document/passage[1]/infon[@key='journal-title']`,
  title: `collection/document/passage[1]/text`,
  abstract: `collection/document/passage[2]/text`,
  id: "collection/document/id",
};

async function parseXMLtoDocument(
  filePath: string,
): Promise<DocumentMetadata | null> {
  try {
    const xmlContent = fs.readFileSync(filePath, "utf-8");
    return (await transform(xmlContent, template)) as DocumentMetadata;
  } catch (error) {
    console.error("Error parsing XML:", error);
    return null;
  }
}

const engine = new MatchingEngine();
