# UCSD Library Chatbot - Agentic RAG & API System

An intelligent chatbot supporting UCSD librarians by asynchronously answering student questions through an agentic two-path workflow: RAG retrieval for knowledge-based queries and API integration for catalog searches.

## System Overview

**Architecture**: Next.js web application with intelligent query routing

**Two Processing Paths**:
1. **RAG Pipeline** - LibAnswers FAQ retrieval via Qdrant vector DB + Cohere reranking
2. **API Integration** - Query reformulation + Ex Libris Primo VE catalog search + reasoning

**Core Technologies**: OpenAI (routing & generation), Qdrant (vector DB), Cohere (reranking)

## Core Components

- **Query Router** - Routes to RAG or API path
- **RAG Pipeline** - Semantic search + reranking for FAQs
- **API Module** - Reformulates queries for Primo VE
- **Reasoning Model** - Synthesizes catalog results
- **Response Generator** - Assembles final student-facing answers

## Data Sources

### LibAnswers FAQ Database
- Library policies & procedures
- Computing resources how-to guides
- Billing information
- Building details

### Primo VE Discovery Platform
- Local and consortia library resources

## Data Processing

### FAQ Preparation
- Consolidate `question` + `details` fields
- Strip HTML from `answer`
- Remove unnecessary fields (`owner`, `short_answer`)
- Preserve: questions, answers, topics, keywords, links

### Primo VE Processing
1. Reformulate natural language → structured discovery query
2. Restructure API response (title, author, description, availability)
3. Pass clean data to reasoning model

## Chunking Strategy

**Current Approach**: No chunking (FAQ entries sufficiently concise)

**Fallback Plan**: Semantic chunking for entries >700 words (pending validation)

## Data Schemas

### FAQ Schema (LibAnswers)
```typescript
interface FAQ {
  faqid: number;
  group_id: number;
  question: string;
  details: string;
  answer: string;
  topics: Array;
  keywords: Array;
  url: {
    public: string;
    admin: string;
  };
  totalhits: number;
  created: string;
  updated: string;
  votes: {
    yes: number;
    no: number;
  };
  links: Array;
  files: Array;
}
```

### Primo VE API Response Schema
```typescript
interface PrimoVEResponse {
  resDetails: {
    totalResultsLocal: number;
    totalResultsPC: number;
    total: number;
    first: number;
    last: number;
  };
  docInfo: Array;
}
```

### Processed Primo VE Document (for Reasoning Model)
```typescript
interface ProcessedPrimoDoc {
  title: string;
  type: string;
  publisher?: string;
  subjects: string[];
  contents?: string;
  permalink: string;
  recordId: string;
  hasFullText: boolean;
}
```

---

**Goal**: Reduce librarian workload while delivering accurate, context-aware responses to diverse student inquiries.

## Prerequisites

Before getting started, you'll need to set up the following services:

### Required API Keys

1. **OpenAI API Key** (https://platform.openai.com/api-keys)
    - You'll need at least $5 in credits on your OpenAI account
    - Used for embeddings, chat completions, routing logic, and reasoning

2. **Qdrant API Key** (https://cloud.qdrant.io/)
    - Free tier available
    - Used for vector database storage and semantic search

3. **Cohere API Key** (https://cohere.com/)
    - Free tier available
    - Used for reranking retrieved FAQ results

4. **Ex Libris Primo VE API Key** (https://developers.exlibrisgroup.com/)
    - Institutional access required
    - Used for catalog search and resource discovery

5. **Springshare LibAnswers API Key** (https://springshare.com/libanswers/)
    - Institutional access required
    - Used for retrieving FAQ data from LibAnswers

6. **Helicone API Key** (https://www.helicone.ai/)
    - Free tier available
    - Used for LLM observability and monitoring

Create a `.env` file in the root directory with these keys:
```
OPENAI_API_KEY=your_openai_key_here
QDRANT_API_KEY=your_qdrant_key_here
QDRANT_URL=your_qdrant_cluster_url
COHERE_API_KEY=your_cohere_key_here
PRIMO_VE_API_KEY=your_primo_api_key_here
LIBANSWERS_API_KEY=your_libanswers_key_here
HELICONE_API_KEY=your_helicone_key_here
OPENAI_FINETUNED_MODEL=your_finetuned_model_id (optional)
```