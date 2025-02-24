"use client";

import { EditorContent, useEditor } from "@tiptap/react";

import AIComposeButton from "./ai-compose-button";
import { Button } from "~/components/ui/button";
import EditorMenuBar from "./editor-menubar";
import { Input } from "~/components/ui/input";
import React from "react";
import { Separator } from "~/components/ui/separator";
import StarterKit from "@tiptap/starter-kit";
import TagInput from "./tag-input";
import Text from "@tiptap/extension-text"
import { generate } from "./action";
import { readStreamableValue } from "ai/rsc";

type Props = {
  subject: string;
  setSubject: (value: string) => void;
  toValues: { label: string; value: string }[];
  setToValues: (values: { label: string; value: string }[]) => void;
  ccValues: { label: string; value: string }[];
  setCcValues: (values: { label: string; value: string }[]) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;
  defaultToolbarExpanded: boolean;
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
  setToValues,
}: Props) => {
  const [value, setValue] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState<boolean>(defaultToolbarExpanded);
  const [token, setToken] = React.useState<string>('')

  const aiGenerate = async(value: string) => {
    const context = editor?.getHTML() || '';
    console.log(context);
    const {output} = await generate(value)
    for await (const token of readStreamableValue(output)){{
      if(token){
        setToken(token)
      }
    }}
  }

  
  const CustomText = Text.extend({
    addKeyboardShortcuts(){
      return {
        'Mod-j': () =>{
          // console.log('Mod-y')
          aiGenerate(this.editor.getText())
          return true
        }
      }
    }
  })

  // Initialize the tiptap editor
  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, CustomText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML())

    },
  });

  React.useEffect(() => {
    editor?.commands?.insertContent(token)
  }, [editor, token])

  // This function receives each token from the AI stream.
  // It logs the token and then inserts it into the editor at the current cursor position.
  const onGenerate = (token: string) => {
    console.log("Generated token:", token);
    editor?.chain().focus().insertContent(token).run();
  };

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
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}

        <div className="flex items-center gap-2">
          <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <span className="text-green-600 font-medium">Draft{" "}</span>
            <span>to {to.join(", ")}</span>
          </div>
          <AIComposeButton isComposing={defaultToolbarExpanded} onGenerate={onGenerate} />
        </div>
      </div>

      <div className="prose w-full px-4">
        <EditorContent editor={editor} value={value}/>
      </div>

      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
          Tip: Press{" "}
          <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            CMD+J or CTRL+J
          </kbd>{" "}
          for AI auto-completion.
        </span>

        <Button
          onClick={async () => {
            editor?.commands.clearContent();
            await handleSend(editor?.getHTML() || "");
          }}
          disabled={isSending}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
