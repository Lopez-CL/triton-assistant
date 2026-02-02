import { openaiClient } from "@/app/libs/openai/openai";
import { qdrantClient } from "@/app/libs/qdrant";
import { NextRequest, NextResponse } from "next/server";
import { LinkedInPost } from "@/app/libs/chunking";
export async function POST(request: NextRequest) {
    const bodyOfPosts:LinkedInPost[] = await request.json();
    for (const post of bodyOfPosts) {
        if (post.text.length < 100) {
            continue;
        }
        console.log(post)
        try {
            const embeddings = await openaiClient.embeddings.create({
                model: 'text-embedding-3-small',
                dimensions: 512,
                input: post.text
            });
            await qdrantClient.upsert('linkedin-posts', {
                wait: true,
                points: [{
                    id: crypto.randomUUID(),
                    vector: embeddings.data[0].embedding,
                    payload: {
                        contentType: post.contentType,
                            content: post.text,
                            url: post.url,
                            date: post.date,
                            likes: post.likes,
                            shares: post.shares,
                            views: post.views,
                    }
                }]

            })
        }catch(error){
        console.error('Issue with posting linkedin posts', error)
    }   
    }
}