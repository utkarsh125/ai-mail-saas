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
      <motion.div className="flex flex-1 flex-col p-4 items-end rounded-lg bg-gray-100 pb-4 shadow-inner dark:bg-gray-100">
        <div
          id="message-container"
          className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-scroll"
        >
          <AnimatePresence mode="wait">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                className={cn(
                  "z-10 mt-2 max-w-[250px] break-words rounded-2xl p-2",
                  message.role === "user"
                    ? "self-end text-gray-800 dark:text-gray-100 bg-gray-200"
                    : "self-start bg-blue-500 text-white"
                )}
                transition={{ type: "easeOut", duration: 0.2 }}
              >
                <div className="text-[15px] leading-[15px]">
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="self-start bg-blue-500 text-white rounded-2xl p-2">
              Loading...
            </div>
          )}
        </div>

        {messages.length > 0 && <div className="h-4" />}

        <div className="w-full">
          {messages.length === 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-4">
                  <SparklesIcon className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="text-gray-900 dark:text-gray-100">
                      Ask AI about anything regarding your emails
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Get answers to your questions about your emails
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
                    onClick={() =>
                      handlePresetClick("When is my next meeting?")
                    }
                    className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                  >
                    When is my next meeting?
                  </span>
                </div>
              </div>
            </div>
          )}
          <form className="flex w-full items-center" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask AI anything about your emails"
              value={input}
              onChange={handleInputChange}
              className="relative h-9 flex-grow rounded-full border border-gray-200 bg-white px-3 py-1 text-[15px] outline-none placeholder:text-[13px]"
            />
            {input && (
              <motion.div
                key={messages.length}
                className="ml-2 flex flex-grow items-center overflow-hidden rounded-md bg-gray-800 px-3 py-2 text-[15px] text-gray-200"
                transition={{ type: "easeOut", duration: 0.2 }}
              >
                {input}
              </motion.div>
            )}
            <button
              type="submit"
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-200"
            >
              <Send className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AskAI;
