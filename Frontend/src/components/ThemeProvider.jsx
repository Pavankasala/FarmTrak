// src/components/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";

const ThemeContext = createContext(null);

/**
 * Custom hook to access theme context
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * ThemeProvider handles light/dark theme toggling.
 * Persists theme in localStorage and updates <html> class.
 * Provides a reusable HoverLift component for consistent card/table animations.
 */
const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("transition-colors", "duration-300"); // Smooth theme transition
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Reusable HoverLift animation wrapper
  const HoverLift = ({ children }) => (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      whileHover={{ scale: 1.03, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
    >
      {children}
    </motion.div>
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, HoverLift }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
