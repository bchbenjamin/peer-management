'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'spc_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const isReady = true;
  const setTheme = useCallback(() => {
    setThemeState('dark');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    window.localStorage.setItem(STORAGE_KEY, 'dark');
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, isReady }), [theme, setTheme, isReady]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
