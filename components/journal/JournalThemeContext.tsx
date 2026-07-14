"use client";

import { createContext, useContext } from "react";
import type { JournalTheme } from "./night/journalTheme";

const JournalThemeContext = createContext<JournalTheme | null>(null);

export interface JournalThemeProviderProps {
  theme: JournalTheme;
  children: React.ReactNode;
}

export function JournalThemeProvider({ theme, children }: JournalThemeProviderProps) {
  return <JournalThemeContext.Provider value={theme}>{children}</JournalThemeContext.Provider>;
}

export function useJournalTheme(): JournalTheme {
  const theme = useContext(JournalThemeContext);
  if (!theme) {
    throw new Error("useJournalTheme must be used within a JournalThemeProvider");
  }
  return theme;
}
