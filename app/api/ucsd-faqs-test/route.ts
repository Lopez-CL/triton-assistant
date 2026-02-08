import { openaiClient } from '@/app/libs/openai/openai';
import { qdrantClient } from '@/app/libs/qdrant';
// import { cohereClient } from '@/app/libs/cohere';
import { NextRequest, NextResponse } from 'next/server';
import { FAQ } from '@/app/types';

export async function POST(request: NextRequest){
    const body = await request.json();
    const {query, topK} = body

    const candidateLimit = Math.max(topK * 2, 3);

    const embedding = await openaiClient.embeddings.create({
        model:'text-embedding-3-small',
        dimensions: 512,
        input: query
    })
    const qDrantResults = await qdrantClient.search('ucsd-faqs',{
        vector: embedding.data[0].embedding,
        limit: candidateLimit,
        with_payload:true
    })
    const faqs = qDrantResults.map((res)=>{
        const payload = res.payload as FAQ;
        return{
            ...payload,
            Relscore: res.score
        }
    })
    
    return NextResponse.json({
        results: faqs,
        query: query
    })
}