// src/components/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

/**
 * Custom hook to access theme context
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * ThemeProvider handles light/dark theme toggling.
 * Persists theme in localStorage and updates <html> class.
 */
const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    // Check localStorage first, fallback to system preference
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("transition-colors", "duration-300"); // smooth switch
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
