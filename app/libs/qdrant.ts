import {QdrantClient} from '@qdrant/js-client-rest';

export const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
});

// try {
//     const result = await client.getCollections();
//     console.log('List of collections:', result.collections);
// } catch (err) {
//     console.error('Could not get collections:', err);
// }