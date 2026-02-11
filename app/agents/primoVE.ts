import { AgentRequest, AgentResponse } from "./types";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { primoVEApiCall } from "../scripts/primo-call";
import * as Types from '../types'
export async function primoSynthesis(request:AgentRequest):Promise<AgentResponse>{
    try{
        const {query} = request
        const primoResp: Types.ModPrimoResponse | undefined = await primoVEApiCall(query);
        if(!primoResp) throw new Error('Unsuccessful Primo API call')
        console.log(`Retrivied the following from Primo:,${primoResp}`)
        return streamText({
            model: openai('gpt-4.1-mini'),
            messages:[
                {role:'system',
                    content:`You are a helpful librarian at UC San Diego. Generate a well-structured, concise markdown synthesis of items from the online catalog with respect to the user's research query, using this format:
                    ## [Heading that capture research insterest]
                        [A concise, synthesis paragraph of the top resources retrieved using their title, description, and contents to sort out relevance an usefulness to the query. You always reference the sources in your breakdown by providing a inline footnote that links to the particular resource a thought is coming from, e.g, [1](Permalink to source)]
                    Rules:
                    - Always use ## for main heading and ### for subsections,
                    - ignore resources that aren't relevant to query
                    online catalog retrieval: ${primoResp}
                    `
                },
                {
                    role:'user',
                    content: query,
                }
            ],
            temperature: 0.8
        });
    }catch{
        throw new Error("Unable to successfully call API and complete OpenAI streamtext")
    }
}