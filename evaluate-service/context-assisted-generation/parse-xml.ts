import camaro from "camaro";
import { readFile } from "fs/promises";

export interface DocumentMetadata {
  id: string;
  keywords: string;
  journal: string;
  title: string;
  abstract: string;
}

const template = {
  keywords: `/collection/document/passage[1]/infon[@key='kwd']`,
  journal: `/collection/document/passage[1]/infon[@key='journal-title']`,
  title: `collection/document/passage[1]/text`,
  abstract: `collection/document/passage[2]/text`,
  id: "collection/document/id",
};

export async function parseXMLtoDocument(
  filePath: string,
): Promise<DocumentMetadata | null> {
  try {
    const xmlContent = await readFile(filePath, "utf-8");
    if (!xmlContent) throw new Error();
    return (await camaro.transform(xmlContent, template)) as DocumentMetadata;
  } catch (error) {
    console.error("Error parsing XML:", error);
    return null;
  }
}
