import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/app/libs/openai/openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod'; // here's the object, here's kind of data to expect...
import { agentTypeSchema, messageSchema } from '@/app/agents/types';
import { agentConfigs } from '@/app/agents/config';

const selectAgentSchema = z.object({
	messages: z.array(messageSchema).min(1),
});

const offTopicGuardSchema = z.object({
	offTopic: z
	.boolean()
	.describe(`If the query or general conversation is off topic, provide "true" if it isn\'t, provide false`)
})

const agentSelectionSchema = z.object({
	agent: agentTypeSchema,
	query: z
	.string()
	.describe('refine the query for agent, remove spelling mistakes and improper grammar.'),
	confidence: z
	.number()
	.min(1)
	.max(10)
	.describe("give me a confidence score between 1 and 10"),
});

// Step 1 grab most recent and previous query (if there) to assess if the user is asking a question the application should respond to.
// Step 2 if it's acceptable, proceed as normal
// Step 3 if it isn't, generate concise response to ask that user to provide a query that the model can actually help with in light of the model's scope.
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const parsed = selectAgentSchema.parse(body);
		const { messages } = parsed;
		// Last two responses for immediate context to account for terse/one word answers
		const lastTwoMessages = messages.slice(-2);		

		// Build agent descriptions from config
		const agentDescriptions = Object.entries(agentConfigs)
			.map(([key, config]) => `- "${key}": ${config.description}`)
			.join('\n');
		// Gate check	
		const isOffTopic = await openaiClient.responses.parse({
				model: 'gpt-4o-mini',
				input:[{
					role: 'system',
					content:`Based on these agent config options: ${JSON.stringify(agentDescriptions)}, determine if the user's query fits their scope.`
				},
				...lastTwoMessages
				],
				temperature: 0.1,
				text:{
					format: zodTextFormat(offTopicGuardSchema, 'offTopicGuard')
				}
			})
			// console.log(isOffTopic)
			const {offTopic} = isOffTopic.output_parsed ?? {};
			if(offTopic) return NextResponse.json({offTopic},{status: 422})
		// TODO: Step 1 - Call OpenAI with structured output
			// Take last 5 messages for context
			const recentMessages = messages.slice(-5); //naive cheap way to do this, but effective!
			const response = await openaiClient.responses.parse({
				model: 'gpt-4o-mini',
				input:[{
					role: 'system',
					content:`Pick the best agent based on the user query. The agents are: ${JSON.stringify(agentDescriptions)}`
				},
				...recentMessages
				],
				temperature: 0.1,
				text:{
					format: zodTextFormat(agentSelectionSchema, 'agentSelection')
				}
			})
		// TODO: Step 2 - Extract the parsed output
		const {agent, query,confidence} = response.output_parsed ?? {};
		console.log(
			'response',
			JSON.stringify(response.output_parsed, null, 2)
		);
		// if(confidence && confidence <= 5)
		// TODO: Step 3 - Return the result
			return NextResponse.json({
			agent,
			query,
			confidence,
		});
	} catch (error) {
		console.error('Error selecting agent:', error);
		return NextResponse.json(
			{ error: 'Failed to select agent' },
			{ status: 500 }
		);
	}
}
