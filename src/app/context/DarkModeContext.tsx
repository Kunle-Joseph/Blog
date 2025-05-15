"use client";
import { createContext, useContext } from "react";

type DarkModeContextType = {
  darkMode: true; // Always true since we're only using dark mode
};

const DarkModeContext = createContext<DarkModeContextType>({ darkMode: true });

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  // Add dark mode class to html element
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("dark");
  }

  return (
    <DarkModeContext.Provider value={{ darkMode: true }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => {
  return useContext(DarkModeContext);
};
