// src/pages/Welcome.jsx
import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { logOut, isLoggedIn, logIn } from "../utils/login";
import LoginModal from "../components/LoginModal";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Reusable Tooltip Component
function Tooltip({ text, children }) {
  return (
    <span className="relative group cursor-pointer">
      {children}
      <span className="absolute right-0 bottom-full mb-2 w-max max-w-xs 
        bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 
        transition pointer-events-none z-20">
        {text}
      </span>
    </span>
  );
}

function Welcome() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [showLogin, setShowLogin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) navigate("/dashboard");
  }, [navigate]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Tutorial shown only once
    const seen = localStorage.getItem("welcomeTutorialSeen");
    if (!seen) {
      setShowTutorial(true);
    }
  }, []);

  function handleLogout() {
    logOut();
    navigate("/");
  }

  const handleLoginSuccess = ({ token, email }) => {
    logIn(token, email);
    setShowLogin(false);
    navigate("/dashboard");
  };

  const dismissTutorial = () => {
    localStorage.setItem("welcomeTutorialSeen", "true");
    setShowTutorial(false);
  };

  return (
    <div className="relative bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen">
      {/* Top-right controls */}
      <div className="absolute top-4 right-8 flex items-center gap-3 z-10">
        <Tooltip text={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-light-muted dark:hover:bg-dark-dim transition"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-700" />}
          </button>
        </Tooltip>

        {isLoggedIn() ? (
          <Tooltip text="Logout and end your session">
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🔓 Logout
            </button>
          </Tooltip>
        ) : (
          <Tooltip text="Login to access your FarmTrak dashboard">
            <button
              onClick={() => setShowLogin(true)}
              aria-label="Login"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              🔐 Login
            </button>
          </Tooltip>
        )}
      </div>

      {/* Hero Section */}
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <h1 className="text-5xl font-semibold sm:text-7xl transition-transform duration-500 hover:scale-105">
          Welcome to <span className="text-light-primary dark:text-dark-primary">FarmTrak</span>
        </h1>
        <p className="mt-6 text-lg text-light-subtext dark:text-dark-subtext max-w-2xl">
          Manage your poultry with ease. Track flocks, expenses, health, and more.
        </p>
        <div className="mt-8 flex justify-center gap-x-6">
          <Tooltip text="Take me to my dashboard or sign in if not logged in yet">
            <button
              onClick={() => {
                if (isLoggedIn()) navigate("/dashboard");
                else setShowLogin(true);
              }}
              className="bg-light-primary hover:bg-light-primaryHover dark:bg-dark-primary dark:hover:bg-dark-primaryHover px-4 py-2 rounded text-white"
            >
              🧠 Get Started
            </button>
          </Tooltip>
        </div>
      </div>

      {/* One-time Tutorial Banner */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-100 dark:bg-blue-900/30 
              text-blue-800 dark:text-blue-200 px-6 py-3 rounded-xl shadow-lg text-sm max-w-lg"
          >
            👋 Welcome to <b>FarmTrak</b>!  
            Use the <span className="font-semibold">🌙 toggle</span> to switch theme.  
            Click <span className="font-semibold">🔐 Login</span> to access your dashboard.  
            <div className="mt-2 flex justify-end">
              <button
                onClick={dismissTutorial}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs"
              >
                Got it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
    </div>
  );
}

export default Welcome;
