import { AgentRequest, AgentResponse } from './types';
import { openaiClient } from '@/app/libs/openai/openai';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { qdrantClient } from '../libs/qdrant';
import { cohereClient } from '../libs/cohere';

export async function ragAgent(request: AgentRequest): Promise<AgentResponse> {
	const { query } = request;

	const embedding = await openaiClient.embeddings.create({
		model: 'text-embedding-3-small',
		dimensions: 512,
		input: query,
	});

	const ucsdFaqs = await qdrantClient.search('ucsd-faqs', {
		vector: embedding.data[0].embedding,
		limit: 2, // at the moment we have so few FAQs that are so sparesly related.
		with_payload: true,
	});

	console.log('Non-re-ranked FAQS:\n', JSON.stringify(ucsdFaqs, null, 2));

	const faqs = [
		...ucsdFaqs.map((faq) => faq.payload?.content as string),
	];

	// Unlear to me atm if only 2 need to be reranked, need to see output exampls
	// const rerankedDocuments = await cohereClient.rerank({
	// 	model: 'rerank-english-v3.0',
	// 	query: query,
	// 	documents: faqs,
	// 	topN: 10,
	// });

	// console.log(
	// 	'rerankedDocuments',
	// 	JSON.stringify(rerankedDocuments, null, 2)
	// );

	// Map the reranked results back to the original documents using the index
	// const topDocuments = rerankedDocuments.results.map(
	// 	(result) => faqs[result.index]
	// );

	// we want to generate a linkedin post based on a user query
	return streamText({
		model: openai('gpt-5'),
		messages: [
			{
				role: 'system',
				content: `
				In markdown format, generate a response to the user's query that summarizes UC San Diego Library's faq["answer"]. Link out to any faq["links"] or media, using faq["files"]. End your response directing users to the FAQ page using the faq["url"]["public"] link.
				Authoritative FAQ: ${JSON.stringify(faqs[0], null, 2)}
				`,
			},
			{
				role: 'user',
				content: query,
			},
		],
		temperature: 0.8,
	});
}