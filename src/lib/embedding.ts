import axios from "axios";

/**
 * @param text - The input text to embed.
 * @returns A Promise resolving to an array of numbers (the embedding vector).
 */
export async function getEmbeddings(text: string): Promise<number[]> {
  const COHERE_MODEL = "embed-english-v2.0"; // Cohere's embedding model ID.
  const COHERE_API_KEY = process.env.COHERE_API_KEY;

  if (!COHERE_API_KEY) {
    throw new Error("Cohere API token not provided. Set COHERE_API_KEY in your environment.");
  }

  try {
    const response = await axios.post(
      "https://api.cohere.ai/embed",
      {
        texts: [text.replace(/\n/g, " ")], // Replace newline characters with spaces.
        model: COHERE_MODEL,
      },
      {
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Cohere returns an object with an "embeddings" array (one per input text).
    return response.data.embeddings[0];
  } catch (error: any) {
    const errorText = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`Cohere embeddings API error: ${errorText}`);
  }
}

// // Example usage:
// (async () => {
//   try {
//     const embedding = await getEmbeddings("Hello World!");
//     console.log("Embedding length:", embedding.length);
//   } catch (err) {
//     console.error(err);
//   }
// })();
