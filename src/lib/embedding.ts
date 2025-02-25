import axios from "axios";

/**

 * @param text - The input text to embed.
 * @returns A Promise resolving to an array of numbers (the embedding vector). 
 */
export async function getEmbeddings(text: string): Promise<number[]> {
  const HF_MODEL = "sentence-transformers/all-roberta-large-v1"; // Change this model name if needed.
  const HF_API_TOKEN = process.env.HF_API_TOKEN;

  if (!HF_API_TOKEN) {
    throw new Error("Hugging Face API token not provided. Set HF_API_TOKEN in your environment.");
  }

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`,
      {
        inputs: text.replace(/\n/g, " ")//replacing all the new line text with spaces
      },
      {
        headers: {
          "Authorization": `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    // The response is typically a 2D array (an array per sentence).
    // For a single text input, return the first embedding.
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorText = JSON.stringify(error.response.data);
      throw new Error(
        `Hugging Face API error: ${error.response.status} ${error.response.statusText} - ${errorText}`
      );
    } else {
      console.error("Error calling Hugging Face embeddings API:", error);
      throw error;
    }
  }
}

console.log((await getEmbeddings('Hello World!')).length)
