"use client";

import { AnimatePresence, motion } from "framer-motion";

import React from "react";
import { cn } from "~/lib/utils";

const AskAI = () => {
  const messages: any[] = [];

  return (
    <div className="mb- p-4">
      <motion.div className="flex flex-1 items-end rounded-lg bg-gray-100 pb-4 shadow-inner dark:bg-gray-100">
        <div
          className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-scroll"
          id="message-container"
        >
          <AnimatePresence mode="wait">
            {messages.map((message) => {
              return (
                <motion.div key={message.id} layout="position"
                className={cn(`z-10 mt-2 max-w-[250px] break-words rounded-2xl bg-gray-200 dark:bg-gray-800`, {
                    'self-end text-gray-800 dark:text-gray-100' : message.role === 'user',
                    'self-start bg-blue-500 text-white': message.role ==='assistant'
                })}
                layoutId={`container-[${message.id}]`}
                transition={{
                    type: 'easeOut',
                    duration: 0.2
                }}
                >
                    <div className="px-3 py-2 text-[15px] leading-[15px]">
                        {message.content}
                    </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AskAI;
