"use client";

import React, { useEffect, useState } from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>; // Avoid hydration mismatch
  }

  return (
    <NextThemesProvider {...props} defaultTheme="system" attribute="class">
      {children}
    </NextThemesProvider>
  );
}
