// Needs work
// export interface PrimoSearchResult {
//     title: string;
//     authors: string[];
//     date: string;
//     type: string;
//     description: string;
//     source: string[];
//     subjects: string[];
//     link: string | null;
// }

export interface FacetValue {
    value: string;
    count: string;
}

export interface Facet {
    name: string;
    values: FacetValue[];
}

export interface PrimoDoc {
    pnx: {
        links?: {
            linktohtml?: string[];
            linktopdf?: string[];
            linkunpaywall?: string[];
            openurl?: string[];
            thumbnail?: string[];
        };
        control:{
            recordid?:string[];
            sourceid?:string[];
        };
        content?:string;
        display: {
            title?: string[];
            creator?: string[];
            creationdate?: string[];
            type?: string[];
            language?: string[];
            publisher?: string[];
            description?: string[];
            contents?: string[];
            source?: string[];
            subject?: string[];
            genre?: string[];
        };
    };
    delivery: {
        availability?:string[];
    };
    context?: string;
    adaptor?: string;
}

export interface PrimoResponse {
    info: {
        total: number;
        totalResultsLocal: number;
        totalResultsPC: number;
        first?: number;
        last?: number;
    };
    docs: PrimoDoc[];
    did_u_mean?: string;  // Spelling suggestion
    facets?: Facet[];     // Filter options
    highlights?: {
        snippet?: string[];
        title?: string[];
        termsUnion?: string[];
        description?: string[];
        toc?: string[];
        addtitle?: string[];
    };
    timelog?: Record<string, string>;
}

export type ModPrimoResponse = {
    resDetails: PrimoResponse["info"],
    docInfo: {
        docDetails: {
            title: PrimoDoc['pnx']['display']['title'],
            type: PrimoDoc['pnx']['display']['type'],
            language: PrimoDoc['pnx']['display']['language'],
            publisher: PrimoDoc['pnx']['display']['publisher'],
            genre: PrimoDoc['pnx']['display']['genre'],
            subject: PrimoDoc['pnx']['display']['subject'],
            description: PrimoDoc['pnx']['display']['description'],
            contents: PrimoDoc['pnx']['display']['contents']},
        permaLink: string,
        recordid: PrimoDoc['pnx']['control']['recordid']
        hasFullText: boolean
    },
    querySuggestions: PrimoResponse['did_u_mean'],
    // facets: PrimoResponse['facets']
}