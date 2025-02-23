"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import React, { useState } from "react";

import { BotIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { generateEmail } from "./action";
import { readStreamableValue } from "ai/rsc";
import { turndown } from "~/lib/turndown";
import useThreads from "~/hooks/use-threads";

type Props = {
  // Accepts two props:
  // 1. isComposing – indicates whether the user is composing
  // 2. onGenerate – callback for each token generated (used to update the editor)
  isComposing: boolean;
  onGenerate: (token: string) => void;
};

const AIComposeButton = (props: Props) => {
  const [open, setOpen] = useState(false); // controls dialog open/close
  const [prompt, setPrompt] = useState(""); // holds the user's prompt
  const { threads, threadId, account } = useThreads(); //fetching the mails in HTML through this

  const thread = threads?.find((t) => t.id === threadId);

  // This function calls generateEmail and streams tokens from the Gemini API.
  // For each token received, it logs the token and sends it to the parent
  // via the onGenerate callback.
  const aiGenerate = async () => {
    try {


      let context = `
      My name is ${account?.name} and my email is ${account?.emailAddress}.
    `;

    if (thread?.emails && thread.emails.length > 0) {
      for (const email of thread.emails) {
        // Extract and format the sender details properly.
        const fromText =
          typeof email.from === "object"
            ? `${email.from.name || ""} <${email.from.address || ""}>`
            : email.from;

        // Build the content with a clear structure.
        const content = `
        Account Details:
          - Name: ${account?.name}
          - Email: ${account?.emailAddress}
        Email History: 
          - Subject: ${email.subject}
          - From: ${fromText}
          -Sent: ${new Date(email.sentAt).toLocaleString()}
          - Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
       `;
      context += content;
      

      // Build a clear context string: Account details first, then email details.
     
          
        }
      }

      console.log("Generating email with prompt:", prompt);
      const { output } = await generateEmail(context, prompt);
      console.log("Received output:", output);
     

      console.log("Context:", context);

      if (!output) {
        console.error("No output received from AI");
        return;
      }

      // Process the stream token-by-token using readStreamableValue.
      for await (const token of readStreamableValue(output)) {
        if (token) {
          console.log("Token:", token);
          // Pass each token to the parent callback, which will update the editor.
          props.onGenerate(token);
        }
      }
    } catch (error) {
      console.error("Error generating email:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <BotIcon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Smart Compose</DialogTitle>
          <DialogDescription>
            AI will help you compose your email
          </DialogDescription>
        </DialogHeader>

        <div className="h-2"></div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt"
        />

        <div className="h-2"></div>

        <Button
          onClick={async () => {
            await aiGenerate(); // call the AI generation function
            setOpen(false); // close the dialog
            setPrompt(""); // clear the prompt input
          }}
        >
          Generate
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AIComposeButton;
