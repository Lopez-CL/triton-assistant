import { AgentType, AgentConfig } from './types';

export const agentConfigs: Record<AgentType, AgentConfig> = {
	linkedin: {
		name: 'LinkedIn Agent',
		description:
			'Receives input/text and you re-polish the text in a certain voice and tone for LinkedIn',
	},
	rag: {
		name: 'RAG Agent',
		description:
			'For generating a linkedin post based on a user query',
	},
};
