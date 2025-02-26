"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { Send, SparklesIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import useThreads from "~/hooks/use-threads";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AskAIProps {
  isCollapsed: boolean;
}

const AskAI: React.FC<AskAIProps> = ({ isCollapsed }) => {
  const { accountId } = useThreads();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handlePresetClick = (text: string) => {
    setInput(text);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Append the user's message.
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from server");
      }

      const data = await response.json();
      // Expected response: { message: { id, role, content } }
      const assistantMessage: Message = data.message;

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCollapsed) return null;

  return (
    <div className="mb-4 p-4 w-full">
      <motion.div className="flex flex-1 flex-col p-6 items-center rounded-lg bg-gray-100 shadow-lg dark:bg-gray-100">
        <div
          id="message-container"
          className="flex flex-col gap-3 w-full max-h-[50vh] overflow-y-auto pb-4"
        >
          <AnimatePresence mode="wait">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "max-w-[75%] p-3 rounded-xl break-words",
                  message.role === "user"
                    ? "self-end bg-gray-200 text-gray-800"
                    : "self-start bg-blue-500 text-white"
                )}
              >
                <div className="text-sm">{message.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="self-start bg-blue-500 text-white rounded-xl p-3 text-sm"
            >
              Loading...
            </motion.div>
          )}
        </div>

        {messages.length === 0 && (
          <div className="mb-6 w-full">
            <div className="flex flex-col items-center gap-2 text-center">
              <SparklesIcon className="w-8 h-8 text-gray-600" />
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                Ask AI about anything regarding your emails
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get answers to your questions about your emails
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  onClick={() => handlePresetClick("What can I ask?")}
                  className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                >
                  What can I ask?
                </span>
                <span
                  onClick={() => handlePresetClick("When is my next flight?")}
                  className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                >
                  When is my next flight?
                </span>
                <span
                  onClick={() => handlePresetClick("When is my next meeting?")}
                  className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                >
                  When is my next meeting?
                </span>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex w-full items-center">
          <input
            type="text"
            placeholder="Ask AI anything about your emails"
            value={input}
            onChange={handleInputChange}
            className="flex-grow h-10 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none placeholder-gray-400 shadow-sm transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <Send className="w-5 h-5 text-gray-600" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AskAI;
