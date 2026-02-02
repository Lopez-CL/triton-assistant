# Overall Approach

Looking at the data, posts, themselves, I noticed that we have a good set of metadata associated with each post. So first, I'd want to consider what's available there that I'd want to structure as part of my data for the vector databases (VDs). We're given the following:
```urn,text,type,firstName,lastName,numImpressions,numViews,numReactions,numComments,numShares,numVotes,numEngagementRate,hashtags,createdAt (TZ=America/Los_Angeles),link```

which I'd see generated as a Qdrant point like 
``` json
 {
  "id": "urn:li:activity:7354895031272427520",
  "vector": [0.023, -0.154, 0.087, 0.231, -0.098, 0.176, -0.043, 0.299, 0.134, -0.187, 0.065, 0.212, -0.145, 0.078, 0.198, -0.076, 0.143, 0.089, -0.234, 0.167],
  "payload": {
    "type": "ARTICLE",
    "author": {
      "firstName": "Brian",
      "lastName": "Jenney"
    },
    "metrics": {
      "numImpressions": 976,
      "numViews": 870,
      "numReactions": 18,
      "numComments": 8,
      "numShares": 1,
      "numVotes": 0,
      "numEngagementRate": 0.027663934426229508
    },
    "hashtags": [],
    "createdAt": "2025-07-26T08:27:02-07:00",
    "link": "https://www.linkedin.com/feed/update/urn:li:activity:7354895031272427520"
  }
}```

## Simple Approach for LinkedIn Posts

Most of this (with the exception of the text field) translates well into a simple JSON structured I could use for, in the case of Qdrant platform, the payload. For linkedIn posts, I would create an embedding based on the entire post body - they seem short enough, and relying on the metadata to help with topical nuance of a post should be sufficient.

## Article Approach

One computationally heavy but semantically effective chunking strategy would be __semantic chunking__, to capture the nuance within an article. However, it would depend on the level of complexity and topical diversity of an article. It would probably be computationally sound to utilize a mix of taking large chunks of  the are the article itself following a recursive chunking methdology (to capture the unique strcture and semantic structure of each posts) applying chunk overlaps to maintain the semantic continuity.