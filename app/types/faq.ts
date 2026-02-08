export type FAQ = {
    faqid: string;
    group_id: string;
    question: string;
    details: string;
    answer: string;
    short_answer: string;
    owner: {
        id: string;
        name: string;
    };
    totalhits: string;
    created: string; // Could use Date if you parse it
    updated: string; // Could use Date if you parse it
    votes: {
        yes: string;
        no: string;
    };
    url: {
        public: string;
        admin: string;
    };
    topics: Array<{
        id: string;
        name: string;
    }>;
    keywords: Array<{
        id: string;
        name: string;
    }>;
    links: Array<{
        title: string;
        url: string;
    }> | null;
    files: Array<{
        title: string;
        url: string;
    }>;
    media: Array<{
        title: string;
        content: string;
    }>;
};