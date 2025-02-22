"use client";

import { EditorContent, useEditor } from "@tiptap/react";

import { Button } from "~/components/ui/button";
import EditorMenuBar from "./editor-menubar";
import { FaApple } from "react-icons/fa";
import { FaWindows } from "react-icons/fa6";
import { Input } from "~/components/ui/input";
import React from "react";
import { Separator } from "~/components/ui/separator";
import StarterKit from "@tiptap/starter-kit";
import TagInput from "./tag-input";
import { Text } from "@tiptap/extension-text";

type Props = {
    subject: string,
    setSubject: (value: string) => void

    toValues: { label: string, value: string }[]
    setToValues: (values: { label: string, value: string }[]) => void

    ccValues: { label: string, value: string }[]
    setCcValues: (values: { label: string, value: string }[]) => void

    to: string[]
    handleSend: (value: string) => void

    isSending: boolean

    defaultToolbarExpanded: boolean
};

const EmailEditor = ({
  subject, 
  defaultToolbarExpanded, 
  to, 
  toValues,
  ccValues, 
  isSending, 
  handleSend, 
  setSubject, 
  setCcValues, 
  setToValues
}: Props) => {
  const [value, setValue] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState<boolean>(defaultToolbarExpanded);

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          console.log("Meta-j");
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }
  return (
    <div>
      <div className="flex border-b p-4 py-2">
        <EditorMenuBar editor={editor} />
      </div>

      <div className="p-4 pb-0 space-y-2">
        {expanded && (
            <>
                <TagInput 
                    label="To"
                    onChange={setToValues}
                    placeholder="Add Recipients"
                    value={toValues}             
                 />
                <TagInput 
                    label="Cc"
                    onChange={setCcValues}
                    placeholder="Add Recipients"
                    value={ccValues}            
                 />

                 <Input id="subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}/>
            </>
        )}

        <div className="flex items-center gap-2">
            <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <span className="text-green-600 font-medium">
                    Draft {" "}
                </span>

                <span>
                    to {to.join(', ')}
                </span>
            </div>
        </div>
      </div>
      <div className="prose w-full px-4">
        <EditorContent editor={editor} value={value} />
      </div>

      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
            Tip: Press {" "}
            <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                CMD+J or CTRL+J
            </kbd> {" "}
            for AI auto-completion.
        </span>

        <Button onClick={async () => {
            editor?.commands?.clearContent()
            await handleSend(value)
        }} disabled={isSending}>
            Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
