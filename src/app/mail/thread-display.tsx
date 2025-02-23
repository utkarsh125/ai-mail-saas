"use client";

import {
  Archive,
  ArchiveX,
  Clock,
  MoreVertical,
  Trash2,
  Trash2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Button } from "~/components/ui/button";
import EmailDisplay from "./email-display";
import React from "react";
import ReplyBox from "./reply-box";
import { Separator } from "~/components/ui/separator";
import { format } from "date-fns";
import useThreads from "~/hooks/use-threads";

const ThreadDisplay = () => {
  const { threadId, threads } = useThreads();

  // console.log("ThreadId: ", threadId);
  // console.log("threads: ", threads);

  const thread = threads?.find((t) => t.id === threadId);
  // console.log("Current Thread: ", thread);

  return (
    <div className="flex h-full flex-col">
      {/* Button Rule */}
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <Archive className="size-4" />
          </Button>
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <ArchiveX className="size-4" />
          </Button>
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <Trash2 className="size-4" />
          </Button>

          <Separator orientation="vertical" />

          <Button
            className="ml-2"
            variant={"ghost"}
            size="icon"
            disabled={!thread}
          >
            <Clock className="size-4" />
          </Button>

          <div className="ml-auto flex items-center">
            {/* Dropdown Menu */}

            {/* TODO: This is resulting in a button-in-button */}
            {/* FIXED: added asChild props */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="ml-2"
                  variant={"ghost"}
                  size={"icon"}
                  disabled={false}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Star thread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Separator />

      {/* thread Section */}

      {thread ? (
        <>
          <div className="flex flex-1 flex-col overflow-scroll">
            <div className="flex items-center p-4">
              <div className="flex items-center gap-4 text-sm">
                <Avatar>
                  {/* If you have an image source, use it here: */}
                  <AvatarImage
                    alt="avatar"
                  />

                  {/* Fallback is rendered if the image fails or if `src` is undefined */}
                  <AvatarFallback>
                    {thread.emails[0]?.from?.name
                      ?.split(/\s+/)
                      .slice(0, 2)
                      .map(word => word[0]?.toUpperCase())
                      .join(" ")}
                  </AvatarFallback>
                </Avatar>

                <div className="grid gap-1">
                  <div className="font-semibold">
                    {thread.emails[0]?.from.name}
                    <div className="text-xs line-clamp-1">
                      <span className="font-medium">
                        Reply-To: 
                      </span>
                      {thread.emails[0]?.from.address}
                    </div>
                  </div>
                </div>
              </div>

              {thread.emails[0]?.sentAt && (
                <div className="ml-auto text-xs text-muted-foreground">{format(new Date(thread.emails[0]?.sentAt), "PPpp")}</div>
              )}
              
            </div>

            <Separator />
            <div className="max-h-[calc(100vh-500px)] overflow-scroll flex flex-col">
              <div className="p-6 flex flex-col gap-4">
                {thread.emails.map(email => {
                  // return <div key={email.id}>
                  //   {email.subject}
                  // </div>
                  return <EmailDisplay key={email.id} email={email}/>
                })}
              </div>
            </div>
            <div className="flex-1"></div>

            <Separator className="mt-auto"/>

            {/* ReplyBox */}
            <ReplyBox />
          </div>
        </>
      ) : (
        <>
          <div className="p-8 text-center text-muted-foreground">
            No message selected
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadDisplay;
