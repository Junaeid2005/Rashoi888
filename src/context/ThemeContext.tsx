import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark';

interface ThemeContextType {
  theme: 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<'dark'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('theme-burgundy');
    root.classList.add('theme-dark');
    body.classList.remove('theme-burgundy');
    body.classList.add('theme-dark');

    try {
      localStorage.setItem('rashoi_theme_v1', 'dark');
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleTheme = () => {};
  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
