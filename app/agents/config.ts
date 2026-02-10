import { AgentType, AgentConfig } from './types';

export const agentConfigs: Record<AgentType, AgentConfig> = {
	primoCall: {
		name: 'PrimoVE Agent',
		description:
			`Reformulates user queries for Primo VE API and synthesizes results into research guidance`
			// alternative description: Transforms user research queries into optimized API query string for PrimoVE API "q" parameter, then synthesizes returned catalog results into actionable research starting points based on user's research query
	},
	rag: {
		name: 'FAQ Agent',
		description:
			'Providing a user with Library FAQ based on their question about the UC San Diego Library and its services.',
	},
};
