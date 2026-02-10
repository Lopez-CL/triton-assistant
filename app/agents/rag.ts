import { AgentRequest, AgentResponse } from './types';
import { openaiClient } from '@/app/libs/openai/openai';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { qdrantClient } from '../libs/qdrant';
import { cohereClient } from '../libs/cohere';
import { fa } from 'zod/v4/locales';

export async function ragAgent(request: AgentRequest): Promise<AgentResponse> {
	const { query } = request;

	const embedding = await openaiClient.embeddings.create({
		model: 'text-embedding-3-small',
		dimensions: 512,
		input: query,
	});

	const ucsdFaqs = await qdrantClient.search('ucsd-faqs', {
		vector: embedding.data[0].embedding,
		limit: 3, // at the moment we have so few FAQs that are so sparesly related.
		with_payload: true,
	});
	console.log('Non-re-ranked FAQS:\n', JSON.stringify(ucsdFaqs, null, 2));
	const faqDocs =[...ucsdFaqs]
	// Unlear to me atm if only 2 need to be reranked, need to see output exampls
	const rerankedFaqs = await cohereClient.rerank({
		model: 'rerank-english-v3.0',
		query: query,
		documents: faqDocs.map((faq)=>`question:${faq.payload?.question}, answer:${faq.payload?.answer}`),
		topN: 2,
	});
	
	console.log(
		'rerankedFaqs',
		JSON.stringify(rerankedFaqs, null, 2)
	);
	
	// Map the reranked results back to the original documents using the index
	const topFaqs= rerankedFaqs.results.map(
		(result) => faqDocs[result.index]
	);
	const topFAQ = topFaqs[0];
	const faq = [
		{
			score: topFAQ.score,
			title: topFAQ.payload?.question ,
			answer: topFAQ.payload?.answer ,
			shortAnswer: topFAQ.payload?.shortAnswer,
			url: topFAQ.payload?.url,
			...(topFAQ.payload?.hasfiles ? { files: topFAQ.payload?.files }:{}),
			...(topFAQ.payload?.hasmedia ? { media: topFAQ.payload?.media }:{})
		}
	];

	// we want to generate a linkedin post based on a user query
	return streamText({
		model: openai('gpt-5'),
		messages: [
			{
				role: 'system',
				content: ` You are a helpful librarian ay UC San Diego. When provided with FAQ data, generate a markdown-formatted response that:
					- Summarizes the answer clearly
					- Includes any relevant links using markdown syntax [Link Text](URL)
					- Mentions and includes any files or media if present using markdown syntax ![alt text](URL) for images or [link text](URL) for files and including iframe code for other media 
					- Ends with a link to the full FAQ page using markdown syntax [Link Text](URL)

				`,
			},
			{
				role: 'user',
				content: `${query}
				FAQ Data:${JSON.stringify(faq, null, 2)}`,
			},
		],
		temperature: 0.8,
	});
}