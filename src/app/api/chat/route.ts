import { Message } from "ai";
import { OramaClient } from "~/lib/orama";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function POST(req: Request) {
  try {
    // Authenticate the user.
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const validUserId: string = userId;

    // Parse request body for accountId and messages.
    const { accountId, messages } = await req.json();

    // Initialize the Orama client.
    const orama = new OramaClient(accountId);
    await orama.initialize();

    // Get the last user message.
    const lastMessage = messages[messages.length - 1];
    console.log("lastMessage:", lastMessage);

    // Retrieve context via vector search.
    const context = await orama.vectorSearch({ term: lastMessage.content });
    console.log(`${context.hits.length} hits found.`);

    // Build context block from vector search hits.
    const contextBlock = context.hits
      .map((hit: any) => JSON.stringify(hit.document))
      .join("\n");

    // Build system prompt.
    const systemPrompt = `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
THE TIME NOW IS ${new Date().toLocaleString()}

START CONTEXT BLOCK
${contextBlock}
END OF CONTEXT BLOCK

When responding, please follow these guidelines:
- Be helpful, clever, and articulate.
- Base your answer solely on the provided email context.
- If there isn’t enough context to answer, state that you don’t have enough information.
- Do not invent details beyond what the context supports.
- Keep your response concise.`;

    // Combine system and user messages into a prompt.
    const chatMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m: Message) => m.role === "user")
    ];
    const prompt = chatMessages
      .map((m) => `${m.role === "system" ? "System:" : "User:"} ${m.content}`)
      .join("\n");

    console.log("Generated Prompt:\n", prompt);

    // Ensure Cohere API key is set.
    const COHERE_API_KEY = process.env.COHERE_API_KEY;
    if (!COHERE_API_KEY) {
      throw new Error("Cohere API key not provided. Set COHERE_API_KEY in your environment.");
    }

    // Call Cohere's generate endpoint.
    const cohereResponse = await fetch("https://api.cohere.ai/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        model: "command-xlarge-nightly", // adjust model if needed
        max_tokens: 200,
        temperature: 0.7,
        k: 0,
        p: 0.75,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: ["\nUser:"]
      })
    });

    if (!cohereResponse.ok) {
      const errorText = await cohereResponse.text();
      console.error("Cohere API error:", errorText);
      throw new Error("Cohere API error");
    }

    const cohereData = await cohereResponse.json();
    console.log("Cohere response data:", cohereData);

    // Fix: use either cohereData.generations[0].text or cohereData.text.
    let outputText =
      cohereData.generations?.[0]?.text ||
      cohereData.text ||
      "";
      
    //Fallback: If the chatbot is not having enough context
    if (!outputText.trim()) {
      outputText = "I'm sorry, I don't have enough information based on the provided context.";
    }

    // Update chatbot interaction count.
    const today = new Date().toDateString();
    const existingInteraction = await db.chatbotInteraction.findUnique({
      where: { day_userId: { day: today, userId: validUserId } }
    });
    if (existingInteraction) {
      await db.chatbotInteraction.update({
        where: { day_userId: { day: today, userId: validUserId } },
        data: { count: existingInteraction.count + 1 }
      });
    } else {
      await db.chatbotInteraction.create({
        data: { day: today, userId: validUserId, count: 1 }
      });
    }

    // Build assistant message.
    const assistantMessage: Message = {
      id: `${Date.now()}`,
      role: "assistant",
      content: outputText.trim()
    };

    console.log("Assistant Message:", assistantMessage);

    // Return a JSON response.
    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
