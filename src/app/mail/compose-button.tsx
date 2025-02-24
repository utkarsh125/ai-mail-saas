"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

import { Button } from "~/components/ui/button";
import EmailEditor from "./email-editor";
import { Pencil } from "lucide-react";
import React from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import useThreads from "~/hooks/use-threads";

const ComposeButton = () => {
  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [subject, setSubject] = React.useState<string>('');
  const [body, setBody] = React.useState<string>(''); // Currently unused; use if needed

  const { account } = useThreads();
  const sendEmail = api.account.sendEmail.useMutation();

  const handleSend = async (value: string) => {
    if (!account) return;

    sendEmail.mutate(
      {
        accountId: account.id,
        threadId: undefined,
        body: value,
        from: {
          name: account.name ?? "Me",
          address: account.emailAddress ?? "me@example.com",
        },
        to: toValues.map((to) => ({ name: to.value, address: to.value })),
        cc: ccValues.map((cc) => ({ name: cc.value, address: cc.value })),
        replyTo: {
          name: account.name ?? "Me",
          address: account.emailAddress ?? "me@example.com",
        },
        subject: subject,
        inReplyTo: undefined,
      },
      {
        onSuccess: () => {
          toast.success('Email Sent');
        },
        onError: (error) => {
          console.log(error);
          toast.error('Error sending email');
        },
      }
    );
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>
          <Pencil className="size-4 mr-1" /> Compose
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Compose Email</DrawerTitle>
        </DrawerHeader>
        <EmailEditor
          subject={subject}
          setSubject={setSubject}
          toValues={toValues}
          setToValues={setToValues}
          ccValues={ccValues}
          setCcValues={setCcValues}
          handleSend={handleSend}
          isSending={false}
          to={toValues.map((to) => to.value)}
          defaultToolbarExpanded={true}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default ComposeButton;
