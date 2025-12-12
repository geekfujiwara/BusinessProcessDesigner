import { useEffect, useState, type ReactNode } from "react";
import { initialize } from "@microsoft/power-apps/app";

let initializedCalled = false;

type PowerProviderProps = { children: ReactNode }

export function PowerProvider({ children }: PowerProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initializedCalled) {
      setIsInitialized(true);
      return;
    }
    initializedCalled = true;

    const initApp = async () => {
      try {
        await initialize();
        console.log('Power Apps SDK initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('Power Apps SDK initialize failed: ', error);
        setIsInitialized(true); // エラーでもアプリを表示
      }
    };
    initApp();
  }, []);

  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>Power Apps を初期化中...</div>
      </div>
    );
  }

  return <>{children}</>;
}