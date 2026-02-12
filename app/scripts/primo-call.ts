import 'dotenv/config';
// import path from 'path';
// import fs from 'fs';
import { getPrimoPermalink } from '../utilities/permalink-builder';
import * as Types from '../types';
const baseUrl = 'https://api-na.hosted.exlibrisgroup.com/primo/v1/search?vid=01UCS_SDI:UCSD&tab=ArticlesBooksEtc&scope=ArticlesBooksEtc'
const endingParams = '&limit6&Availability=true&lang=eng&inst=01UCS_SDI-UCSD&skipDelivery=true'
// const DIR_PRIMO_EXPL = path.join(process.cwd(), 'app/scripts/data/primo_results');
export async function primoVEApiCall(query: string): Promise<Types.ModPrimoResponse | undefined> {
    try {
        const result = await fetch(`${baseUrl}&q=any,contains,${query}${endingParams}&apikey=${process.env.PRIMO_KEY}`, { headers: { 'Content-Type': 'application/json' } });
        if (!result.ok) throw new Error(`Issue with api call, ${result.status}`)
        const data = await result.json()
        console.log(data.docs.length)

        const primoRes: Types.ModPrimoResponse = {
            resDetails: data.info,
            resDocs: data.docs.map((primoDoc: Types.PrimoDoc) => {
                const availability = primoDoc.delivery?.availability ?? []
                return {
                    ['docDetails']: {
                        title: primoDoc['pnx']['display']['title'],
                        // type: primoDoc['pnx']['display']['type'],
                        // language: primoDoc['pnx']['display']['language'],
                        // publisher: primoDoc['pnx']['display']['publisher'],
                        // genre: primoDoc['pnx']['display']['genre'],
                        subject: primoDoc['pnx']['display']['subject'],
                        description: primoDoc['pnx']['display']['description'],
                        contents: primoDoc['pnx']['display']['contents']
                    },
                    ['permalink']: getPrimoPermalink(primoDoc),
                    recordid: primoDoc.pnx.control.recordid,
                    hasFullText: availability[0] === 'fulltext' ? true : false
                }
            }),
            querySuggestions: data.did_u_mean,
            // facets: data.facets
        }
        /*
        const outputPath = path.join(DIR_PRIMO_EXPL, 'modified_primo_results.json')
        fs.writeFileSync(outputPath, JSON.stringify(primoRes, null, 2))
        console.log(JSON.stringify(primoRes,null,2))
        */
        return primoRes
    } catch (error) {
        console.log(error, "Unable to make API call");
    }
}

// for testing: primoVEApiCall("creativity");