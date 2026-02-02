import { openaiClient } from "@/app/libs/openai/openai";
import { qdrantClient } from "@/app/libs/qdrant";
import { NextRequest, NextResponse } from "next/server";
import { chunkText } from "@/app/libs/chunking";
import type { Chunk, MediumArticle } from "@/app/libs/chunking";

export async function POST(request: NextRequest){
    const bodyOfArticles:MediumArticle[] = await request.json();
    // console.log(bodyOfArticles)
    const allChunks:Chunk[] = []
    for(const article of bodyOfArticles){
        if(article.text.length < 500){
            continue;
        }
        const chunks = chunkText(article.text, 500, 50,article.source)
        chunks.forEach((chunk) => {
				chunk.metadata.title = article.title;
				chunk.metadata.author = article.author;
				chunk.metadata.date = article.date;
				chunk.metadata.contentType = article.source;  // 'medium'
				chunk.metadata.language = article.language;
			});
            allChunks.push(...chunks);
    }
    try{
        for(const chunk of allChunks){
            console.log(chunk)
            const embeddings = await openaiClient.embeddings.create({
                model: 'text-embedding-3-small',
				dimensions: 512,
				input: chunk.content,
            })
        await qdrantClient.upsert('articles', {
				wait: true,
				points: [
					{
						id: crypto.randomUUID(),
						vector: embeddings.data[0].embedding,
						payload: {
							...chunk.metadata,
							content: chunk.content,
						},
					},
				],
			});
        console.log("End of try! Success!")
        }
    }catch(error){
        console.error('Error processing articles', error )
    }
}
