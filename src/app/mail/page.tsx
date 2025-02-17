"use client"; // Ensure this component runs on the client

import React from "react";
import ThemeToggle from "~/components/theme-toggle";
import dynamic from "next/dynamic";

const Mail = dynamic(() => import("./mail"), { ssr: false });

const MailDashboard = () => {
  return (
    <>
    <div className="absolute bottom-4 left-4">
      <ThemeToggle />
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
