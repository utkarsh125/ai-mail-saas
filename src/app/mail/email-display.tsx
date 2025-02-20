"use client"

import Avatar from "react-avatar";
import { Letter } from "react-letter";
import React from "react";
import { RouterOutputs } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { formatDistanceToNow } from "date-fns";
import useThreads from "~/hooks/use-threads";

type Props = {
  email: RouterOutputs["account"]["getThreads"][0]["emails"][0];
};

const EmailDisplay = ({ email }: Props) => {
  const { account } = useThreads();

  // Determine if the email was sent by the current user
  const isMe = account?.emailAddress === email.from.address;

  return (
    <div
      className={cn(
        "border rounded-md p-4 transition-all hover:translate-x-2",
        {
          "border-gray-900 border-4": isMe, // Fixed border class
        }
      )}
    >
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Avatar & Sender Info */}
        <div className="flex items-center gap-3">
          {!isMe && (
            <Avatar
              name={email.from.name ?? email.from.address}
              email={email.from.address}
              size="35"
              textSizeRatio={2}
              round={true}
            />
          )}
          <span className="font-medium text-sm sm:text-base">
            {isMe ? "Me" : email.from.name ?? email.from.address}
          </span>
        </div>
        {/* Time Ago Display */}
        <p className="text-xs sm:text-sm text-gray-500">
          {formatDistanceToNow(email.sentAt ?? new Date(), { addSuffix: true })}
        </p>
      </div>

      {/* Email Body Section */}
      <div className="mt-2 bg-white rounded-md p-2 text-black text-sm sm:text-base">
        <Letter
          html={email?.body ?? ""}
          className="w-full break-words leading-relaxed"
        />
      </div>
    </div>
  );
};

export default EmailDisplay;
