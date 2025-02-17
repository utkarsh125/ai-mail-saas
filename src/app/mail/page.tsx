"use client"; // Ensure this component runs on the client

import React from "react";
import dynamic from "next/dynamic";

const Mail = dynamic(() => import("./mail"), { ssr: false });

const MailDashboard = () => {
  return (
    <Mail
      defaultCollapsed={false}
      defaultLayout={[20, 32, 48]}
      navCollapsedSize={15}
    />
  );
};

export default MailDashboard;
