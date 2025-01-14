import {SourceData} from "../chat-agent-evaluator/chat-completion-model";
import fetch from 'node-fetch';
import {Convert} from "../third-party-schemas/sources/sources-schema";

const pageSize = 6;

export interface CallArguments {
    search_term: string;
    topic: string;
}

function delay_ms(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchSources(query: string, journal: string): Promise<SourceData[] | null> {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${query}&resultType=core&synonym=TRUE&cursorMark=*&pageSize=${pageSize}&format=json`;
    try {
        await delay_ms(50);
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
                url: `https://doi.org/${source.doi}` || '',
                title: source.title,
                abstract: source.abstractText || '',
                journal: source.journalInfo?.journal?.title || '',
                authors: source.authorString || '',
                date: source.firstPublicationDate || ''
            }));
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching sources:', error);
        return null;
    }
}
