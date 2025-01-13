import {SourceData} from "../chat-agent-evaluator/chat-completion-model";
import fetch from 'node-fetch';
import {Convert} from "../third-party-schemas/sources/sources-schema";

const pageSize = 6;

export async function fetchSources(query: string, journal: string): Promise<SourceData[] | null> {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${query}&resultType=core&synonym=TRUE&cursorMark=*&pageSize=${pageSize}&format=json`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (response.ok) {
            const json = await response.text();
            const {resultList: {result}} = Convert.toSourcesSchema(json);
            return result.map(source => ({
                url: source.source,
                title: source.title,
                abstract: source.abstractText,
                journal: source.journalInfo.journal.title,
                authors: source.authorString,
                date: source.firstPublicationDate.toDateString()
            }));
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching sources:', error);
        return null;
    }
}
