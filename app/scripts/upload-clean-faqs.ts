/*import 'dotenv/config'
import { cleanHtmlForEmbed } from './strip-html';
import * as Types from '../scripts/data/types/index'
import path from 'path';
import fs from 'fs'
import { qdrantClient } from '../libs/qdrant';
import { openaiClient } from '../libs/openai/openai';
const FAQ_DIR = path.join(process.cwd(), 'app/scripts/data/faqs');
export async function getFAQs():Promise<void>{
    const baseUrl: string = 'https://ucsd.libanswers.com/api/1.1'
    const endpoint: string = '/faqs';
    try{
    // const authRes = await fetch(`${baseUrl}/oauth/token`,{
    //     method: 'POST',
    //     headers: {'Content-Type':'application/x-www-form-urlencoded'},
    //     body: new URLSearchParams({
    //         'client_id': process.env.CLIENT_ID || '',
    //         'client_secret': process.env.LIBANSW_KEY||'',
    //         'grant_type': 'client_credentials'
    //     })
    // })
    // if(!authRes.ok) throw new Error('Issue with authentication process')
    // const {access_token} = await authRes.json();
    const access_token = 'ddce1ced950fe8ab98ae0fc11d765ff932ef5890';
    console.log(access_token);
    const rawFAQs = await fetch(`${baseUrl}${endpoint}?limit=50&group_id=7798`,{
        method:'GET',
        headers:{
            'Authorization':`Bearer ${access_token}`,
            'Accept': 'application/json'
        }
    })
    const data = await rawFAQs.json()
    const outputPath = path.join(FAQ_DIR, 'processed_faqs.json');
    // create emmbeding of question and answer
    const cleanFaqs = data.faqs.map((faq:Types.FAQ) =>({...faq, answer: cleanHtmlForEmbed(faq.answer)}))
    console.log(cleanFaqs.length)
    // console.log('🚀 Starting faq processing...\n');
    // for(const faq of cleanFaqs){
    //     const quesAndAnsw: string = `Question: ${faq.question}\nAnswer: ${faq.answer}`
    //     const embeddings = await openaiClient.embeddings.create({
    //         model:'text-embedding-3-small',
    //         dimensions: 512,
    //         input: quesAndAnsw
    //     });
    //     await qdrantClient.upsert('ucsd-faqs',{
    //         wait: true,
    //         points:[
    //             {
    //                 id: crypto.randomUUID(),
    //                 vector: embeddings.data[0].embedding,
    //                 payload:{
    //                     ...faq
    //                 }
    //             }
    //         ]
    //     })
    // }
    // fs.writeFileSync(outputPath, JSON.stringify(cleanFaqs,null,2))
    // console.log(`\n📊 Summary:`);
    // console.log(`   FAQs: ${cleanFaqs.length}`)
    }catch(error){
        console.log(error,"Issue with LibApps api call")
        process.exit(1);
    }
}
getFAQs();*/