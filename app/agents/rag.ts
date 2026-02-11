import { AgentRequest, AgentResponse } from './types';
import { openaiClient } from '@/app/libs/openai/openai';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { qdrantClient } from '../libs/qdrant';
import { cohereClient } from '../libs/cohere';
import { fa } from 'zod/v4/locales';

export async function ragAgent(request: AgentRequest): Promise<AgentResponse> {
	const { query } = request;
	console.log('\n=== RAG AGENT START ===');
	console.log('[1] Incoming query:', query);

	console.log('[2] Generating embedding with text-embedding-3-small (512 dims)...');
	const embedding = await openaiClient.embeddings.create({
		model: 'text-embedding-3-small',
		dimensions: 512,
		input: query,
	});

	const ucsdFaqs = await qdrantClient.search('ucsd-faqs', {
		vector: embedding.data[0].embedding,
		limit: 4, // at the moment we have so few FAQs that are so sparesly related.
		with_payload: true,
	});
	console.log('Non-re-ranked FAQS:\n', JSON.stringify(ucsdFaqs, null, 2));
	const faqDocs = [...ucsdFaqs]
	// Unlear to me atm if only 2 need to be reranked, need to see output exampls
	const rerankedFaqs = await cohereClient.rerank({
		model: 'rerank-english-v3.0',
		query: query,
		documents: faqDocs.map((faq) => `question:${faq.payload?.question}, answer:${faq.payload?.answer}`),
		topN: 2,
	});


	// Map the reranked results back to the original documents using the index
	const topFaqs = rerankedFaqs.results.map(
		(result) => faqDocs[result.index]
	);
	console.log(
		'rerankedFaqs',
		JSON.stringify(topFaqs, null, 2)
	);
	const topFAQ = topFaqs[0];
	const faq = [
		{
			score: topFAQ.score,
			title: topFAQ.payload?.question,
			answer: topFAQ.payload?.answer,
			shortAnswer: topFAQ.payload?.shortAnswer,
			url: topFAQ.payload?.url,
			...(topFAQ.payload?.haslinks ? { links: topFAQ.payload?.links } : {}),
			...(topFAQ.payload?.hasfiles ? { files: topFAQ.payload?.files } : {}),
			...(topFAQ.payload?.hasmedia ? { media: topFAQ.payload?.media } : {})
		}
	];
	console.log('[4] FAQ data being sent to LLM:', JSON.stringify(faq, null, 2));

	// we want to generate a linkedin post based on a user query
	return streamText({
		model: openai('gpt-5-mini'),
		messages: [
			{
				role: 'system',
				content: `You are a helpful librarian at UC San Diego. Generate a well-structured, conciser markdown response using this format:

					## [Descriptive Title Based on Question]

					[Very brief summary paragraph answering the question, which includes links to related resources with markdown syntax [Link Title](URL)]

						### Learn More
						- [Full FAQ: Title](public URL from FAQ Data)

				Rules:
				- Always use ## for main heading, ### for subsections
				- Skip sections if no relevant data exists

				FAQ Data:${JSON.stringify(faq, null, 2)}`,
			},
			{
				role: 'user',
				content: `${query}`,
			},
		],
		temperature: 0.7,
	});
}