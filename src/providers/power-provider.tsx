import { useEffect, type ReactNode } from "react";
import { initialize } from "@microsoft/power-apps/app";

type PowerProviderProps = { children: ReactNode }

export function PowerProvider({ children }: PowerProviderProps) {
  useEffect(() => {
    const initApp = async () => {
      try {
        await initialize();
        console.log('Power Platform SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Power Platform SDK:', error);
      }
    };
    
    initApp();
  }, []);

  return <>{children}</>;
}