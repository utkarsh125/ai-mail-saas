"use client"; // Ensure this component runs on the client

import ComposeButton from "./compose-button";
import React from "react";
import ThemeToggle from "~/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const Mail = dynamic(() => import("./mail"), { ssr: false });

const MailDashboard = () => {
  return (
    <>
    <div className="absolute bottom-4 left-4">
      <div className="flex items-center gap-2">
        <UserButton />
        <ThemeToggle />
        <ComposeButton />
      </div>
      
    </div>
    
    <Mail
      defaultCollapsed={false}
      defaultLayout={[20, 32, 48]}
      navCollapsedSize={15}
    />
    </>
  );
};

export default MailDashboard;
