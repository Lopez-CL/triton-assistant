import { AgentRequest, AgentResponse } from "./types";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import {z} from 'zod'
import { primoVEApiCall } from "../scripts/primo-call";
import * as Types from '../types'
import { openaiClient } from "../libs/openai/openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
export async function primoSynthesis(request:AgentRequest):Promise<AgentResponse>{
    try{
        const {query} = request
        const primoQuerySchema = z.object({
            primoQuery: z
            .string()
            .describe(`generate a parameter string for the q parameter for PrimoVE's api`)
        })
        const qString = await openaiClient.responses.parse({
            model:'gpt-4.1-mini',
            input:[{
                role:'system',
                content:`Analyze the user's query, identify keywords in research question, and transform it into a parameter string using the following pattern ~<keyword> AND <keyword> AND... Example: "racial bias" AND "social media" AND;`
            },{
                role:'user',
                content: query
            }],
            temperature: 0.8,
            text: {format:zodTextFormat(primoQuerySchema, 'primoQuerySchema')}
        })
        const {primoQuery} = qString.output_parsed ?? {};
        if(!primoQuery) throw new Error('Failed to parse primo query from response');
        console.log("This is our string for q:", primoQuery)
        const primoResp: Types.ModPrimoResponse | undefined = await primoVEApiCall(primoQuery);
        if(!primoResp) throw new Error('Unsuccessful Primo API call')
        console.log(`Retrivied the following from Primo:,${JSON.stringify(primoResp,null,2)}`)
        
        return streamText({
            model: openai('gpt-4.1-mini'),
            messages:[
                {role:'system',
                    content:`You are a helpful librarian at UC San Diego. Generate a well-structured, fairly concise markdown synthesis of items from the online catalog with respect to the user's research query, using this format:
                    ## [Heading that capture research insterest]
                        [A concise, synthesis paragraph of the top resources retrieved using their title, description, and contents to sort out relevance an usefulness to the query. You always reference the sources in your breakdown by providing a inline footnote that links to the particular resource a thought is coming from, e.g, [1](Permalink to source)]
                    Rules:
                    - Always begin with some variation of "Here's what I got from UCLS using ${primoQuery}"
                    - Always use ## for main heading and ### for subsections,
                    - ignore resources that aren't relevant to query
                    - Every claim in your synthesis should cite from the sources retrieved cite
                    
                    sources retrieved: ${JSON.stringify(primoResp,null,2)}
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