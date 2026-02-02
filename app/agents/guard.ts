import { AgentResponse } from "./types";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function guardAgent(request):Promise<AgentResponse> {
    return streamText({
        model: openai('gpt-4o-mini'),
        temperature: 0.1,
        messages:[
            {role:'system',
            content:`concisely explain why you cannot help with queries within these agent workflows based on the user response ${request.queryGuarded}`
            }
        ]
    })
}