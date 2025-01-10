// To parse this data:
//
//   import { Convert, SourcesSchema } from "./file";
//
//   const sourcesSchema = Convert.toSourcesSchema(json);

export interface SourcesSchema {
    version1: number;
    version: number;
    hitCount: number;
    nextCursorMark: string;
    nextPageUrl: string;
    request: Request;
    resultList: ResultList;
}

export interface Request {
    queryString: string;
    resultType: string;
    cursorMark: string;
    pageSize: number;
    sort: string;
    synonym: boolean;
}

export interface ResultList {
    result: Result[];
}

export interface Result {
    id: string;
    source: string;
    fullTextIdList?: FullTextIDList;
    doi?: string;
    title: string;
    authorString?: string;
    authorList?: AuthorList;
    dataLinksTagsList?: DataLinksTagsList;
    pubYear: string;
    abstractText?: string;
    pubTypeList: PubTypeList;
    bookOrReportDetails?: BookOrReportDetails;
    fullTextUrlList: FullTextURLList;
    isOpenAccess: string;
    inEPMC: string;
    inPMC: string;
    hasPDF: string;
    hasBook: string;
    hasSuppl: string;
    citedByCount: number;
    hasData: string;
    hasReferences: string;
    hasTextMinedTerms: string;
    hasDbCrossReferences: string;
    hasLabsLinks: string;
    license?: string;
    hasEvaluations: string;
    authMan: string;
    epmcAuthMan: string;
    nihAuthMan: string;
    manuscriptId?: string;
    hasTMAccessionNumbers: string;
    dateOfCreation: Date;
    firstIndexDate: Date;
    fullTextReceivedDate?: Date;
    firstPublicationDate: Date;
    pmid?: string;
    journalInfo?: JournalInfo;
    pageInfo?: string;
    affiliation?: string;
    publicationStatus?: string;
    language?: string;
    pubModel?: string;
    grantsList?: GrantsList;
    subsetList?: SubsetList;
    dateOfRevision?: Date;
    electronicPublicationDate?: Date;
    authorIdList?: AuthorIDList;
    keywordList?: KeywordList;
    pmcid?: string;
    commentCorrectionList?: CommentCorrectionList;
}

export interface AuthorIDList {
    authorId: AuthorID[];
}

export interface AuthorID {
    type: string;
    value: string;
}

export interface AuthorList {
    author: Author[];
}

export interface Author {
    fullName: string;
    lastName: string;
    initials: string;
    authorAffiliationDetailsList: AuthorAffiliationDetailsList;
    firstName?: string;
    authorId?: AuthorID;
}

export interface AuthorAffiliationDetailsList {
    authorAffiliation: AuthorAffiliation[];
}

export interface AuthorAffiliation {
    affiliation: string;
}

export interface BookOrReportDetails {
    publisher: string;
    yearOfPublication: number;
}

export interface CommentCorrectionList {
    commentCorrection: CommentCorrection[];
}

export interface CommentCorrection {
    id: string;
    source: string;
    reference: string;
    type: string;
    orderIn: number;
}

export interface DataLinksTagsList {
    dataLinkstag: string[];
}

export interface FullTextIDList {
    fullTextId: string[];
}

export interface FullTextURLList {
    fullTextUrl: FullTextURL[];
}

export interface FullTextURL {
    availability: Availability;
    availabilityCode: AvailabilityCode;
    documentStyle: DocumentStyle;
    site: Site;
    url: string;
}

export enum Availability {
    Free = "Free",
    OpenAccess = "Open access",
    SubscriptionRequired = "Subscription required",
}

export enum AvailabilityCode {
    F = "F",
    Oa = "OA",
    S = "S",
}

export enum DocumentStyle {
    Doi = "doi",
    HTML = "html",
    PDF = "pdf",
}

export enum Site {
    Doi = "DOI",
    EuropePMC = "Europe_PMC",
    PubMedCentral = "PubMedCentral",
}

export interface GrantsList {
    grant: Grant[];
}

export interface Grant {
    agency: string;
    orderIn: number;
}

export interface JournalInfo {
    volume?: string;
    journalIssueId: number;
    dateOfPublication: string;
    monthOfPublication: number;
    yearOfPublication: number;
    printPublicationDate: Date;
    journal: Journal;
    issue?: string;
}

export interface Journal {
    title: string;
    medlineAbbreviation: string;
    essn: string;
    issn: string;
    isoabbreviation: string;
    nlmid: string;
}

export interface KeywordList {
    keyword: string[];
}

export interface PubTypeList {
    pubType: string[];
}

export interface SubsetList {
    subset: Subset[];
}

export interface Subset {
    code: string;
    name: string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toSourcesSchema(json: string): SourcesSchema {
        return JSON.parse(json);
    }

    public static sourcesSchemaToJson(value: SourcesSchema): string {
        return JSON.stringify(value);
    }
}
