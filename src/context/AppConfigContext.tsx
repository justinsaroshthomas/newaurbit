'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'nature' | 'cyber' | 'crystal';

interface AppConfigContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  lowPowerMode: boolean;
  setLowPowerMode: (value: boolean) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('nature');
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedTheme = localStorage.getItem('aurbit-theme') as Theme;
    const savedPower = localStorage.getItem('aurbit-low-power') === 'true';
    if (savedTheme) setTheme(savedTheme);
    setLowPowerMode(savedPower);
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('aurbit-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const updatePower = (val: boolean) => {
    setLowPowerMode(val);
    localStorage.setItem('aurbit-low-power', String(val));
    if (val) {
      document.body.classList.add('no-lag');
    } else {
      document.body.classList.remove('no-lag');
    }
  };

  return (
    <AppConfigContext.Provider value={{ theme, setTheme: updateTheme, lowPowerMode, setLowPowerMode: updatePower }}>
      {!mounted ? (
        <>{children}</>
      ) : (
        <div data-theme={theme} className={lowPowerMode ? 'no-lag' : ''}>
          {children}
        </div>
      )}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
}
