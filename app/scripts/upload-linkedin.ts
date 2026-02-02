import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs'
import path from 'path'
import { extractLinkedInPosts } from '../libs/chunking';
import { qdrantClient } from '../libs/qdrant';

const DATA_DIR = path.join(process.cwd(), 'app/scripts/data');
const LINKEDIN_CSV = path.join(DATA_DIR, 'brian_posts.csv')
const COLLECTION_NAME = "linkedin-posts";
import { openaiClient } from '../libs/openai/openai';

async function processLinkedinPosts(): Promise<void> {
    console.log('📖 Processing LinkedIn Posts...');
    const csvContent = fs.readFileSync(LINKEDIN_CSV, 'utf-8')
    const allPosts = extractLinkedInPosts(csvContent)
    console.log(`Found ${allPosts.length} posts`)
    const validPosts = allPosts.filter(post => post.text.length >= 100);
    const rejectedCount = allPosts.length - validPosts.length;

    console.log(`Valid posts (>= 100 chars): ${validPosts.length}`);
    console.log(`Rejected posts (< 100 chars): ${rejectedCount}`);
    let successCount = 0;
    let failCount = 0;

    for (const post of validPosts) {
        try {
            const embeddings = await openaiClient.embeddings.create({
                model: 'text-embedding-3-small',
                dimensions: 512,
                input: post.text
            })
            await qdrantClient.upsert(COLLECTION_NAME, {
                wait: true,
                points: [
                    {
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
                    }
                ]
            })
            successCount++;
        } catch (error) {
            console.error(`❌ Failed to upload post: ${post.url}`, error);
            failCount++;
        }
    }
        console.log(`✅ Uploaded post ${successCount}/${validPosts.length}`);
        console.log(`\n📊 Summary:`);
        console.log(`   Successfully uploaded: ${successCount}`);
        console.log(`   Failed: ${failCount}`);
        console.log(`   Total valid posts: ${validPosts.length}`);
        const outputPath = path.join(DATA_DIR, 'processed_linkedin_posts.json');
        fs.writeFileSync(outputPath, JSON.stringify(validPosts, null, 2))
}

async function main() {
    try {
        await processLinkedinPosts()
    } catch (error) {
        console.error('❌ Error processing LinkedIn posts:', error);
        process.exit(1);
    }
}
main()