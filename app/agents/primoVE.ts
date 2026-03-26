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
            .describe(`generated parameter string for the q parameter for PrimoVE's api`)
        })
        const qString = await openaiClient.responses.parse({
            model:'gpt-4.1-mini',
            input:[{
                role:'system',
                content:`Analyze the user's query, identify keywords in the research question, and transform it into a parameter string using the following pattern q=any,contains,<keyword_1>,<operator_1>;any,contains,<keyword_n>,<operator_2>... 
                Rules
                - Your operator options consist of AND, OR, NOT
                - Only base your operator construction on the user's query. Assess your parameter on how well it aligns with the user's query
                - Example: 
                user query - "what's the correlation between mental health and social media use? 
                parameter - q=any,contains, mental health,OR;any,contains,mental well-being,OR;any,contains,psychological health,AND;any,contains,social media use,AND;any,contains,correlation,OR;any,contains,relationship,OR;any,contains,association`
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
                    ## [Heading that capture research interests]
                        [A concise, synthesis paragraph of the top resources retrieved using their title, description, and contents to sort out relevance an usefulness to the query. You always reference the sources in your breakdown by providing a inline footnote that links to the particular resource a thought is coming from, e.g, [[1]](Permalink to source)]
                    Rules:
                    - Always begin with some variation of "Here's what I got from UCLS using ${primoQuery}"
                    - Always use ## for main heading and ### for subsections,
                    - ignore resources that aren't relevant to query
                    - Every claim in your synthesis should cite from the sources retrieved cite
                    - Your Reference list should be a numbered list that coresponds to the footnote number used.
                    - Finally encourage user to explore UCLS themselves using UCLS URL reconstruction of ${primoQuery}. Here's an example:
                        - query: q=any,contains, mental health,OR;any,contains,mental well-being,OR;any,contains,psychological health,AND;any,contains,social media use,AND;any,contains,correlation,OR;any,contains,relationship,OR;any,contains,association
                        - url: https://search-library.ucsd.edu/discovery/search?query=any,contains,(%22mental%20health%22%20OR%20%22mental%20well-being%22%20OR%20%22psychological%20health%22)%20AND%20(%22social%20media%20use%22)%20AND%20(correlation%20OR%20relationship%20OR%20association)&tab=ArticleBooksEtc&search_scope=ArticlesBooksEtc&vid=01UCS_SDI:UCSD
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