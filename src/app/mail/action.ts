"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createStreamableValue } from "ai/rsc";

// Initialize Gemini with your API key (ensure it’s in your .env file)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function generateEmail(context: string, prompt: string) {
    console.log("Context received:", context);

    // Create a streamable response for frontend
    const stream = createStreamableValue();

    (async () => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const fullPrompt = `
            You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by providing suggestions and relevant information based on the context of their previous emails.
            
            THE TIME NOW IS ${new Date().toLocaleString()}
            
            START CONTEXT BLOCK
            ${context}
            
            END OF CONTEXT BLOCK
            
            USER PROMPT:
            ${prompt}
            
            When responding, please keep in mind:
            - Be helpful, clever, and articulate. 
            - Rely on the provided email context to inform your response.
            - If the context does not contain enough information to fully address the prompt, politely give a draft response.
            - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
            - Do not invent or speculate about anything that is not directly supported by the email context.
            - Keep your response focused and relevant to the user's prompt.
            - Don't add fluff like 'Here’s your email' or anything like that.
            - Directly output the email, no need to say 'Here is your email' or anything like that.
            - No need to output subject.
            - Add step-by-step procedure where applicable
            `;

            // Send request to Gemini API
            const result = await model.generateContentStream(fullPrompt);

            for await (const chunk of result.stream) {
                if (chunk.text()) {
                    console.log("Token generated:", chunk.text());
                    stream.update(chunk.text());
                }
            }

            stream.done();
        } catch (error) {
            console.error("Error in Gemini AI generation:", error);
            stream.done();
        }
    })();

    return { output: stream.value };
}
