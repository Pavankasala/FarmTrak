import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { logOut, isLoggedIn, logIn } from "../utils/login";
import FirebaseLogin from "../components/FirebaseLogin"; 

function Welcome() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [showLogin, setShowLogin] = useState(false);
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

  function handleLogout() {
    logOut();
    navigate("/");
  }

  const handleLoginSuccess = async (authResult) => {
    await logIn(authResult.user); 
    setShowLogin(false);
    navigate("/dashboard");
  };

  return (
    <div className="relative bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen">
      <div className="absolute top-4 right-8 flex items-center gap-3 z-10">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <SunIcon className="h-6 w-6 text-yellow-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-700" />
          )}
        </button>

        {isLoggedIn() ? (
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            aria-label="Login"
            className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:bg-light-primaryHover dark:hover:bg-dark-primaryHover font-semibold"
          >
            Login / Sign Up
          </button>
        )}
      </div>

      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <h1 className="text-5xl font-extrabold sm:text-7xl">
          Welcome to <span className="text-light-primary dark:text-dark-primary">FarmTrak</span>
        </h1>
        <p className="mt-6 text-lg text-light-subtext dark:text-dark-subtext max-w-2xl">
          The all-in-one solution to manage your poultry farm with ease. Track flocks, expenses, egg production, and predict feed needs effortlessly.
        </p>
        <div className="mt-8 flex justify-center gap-x-6">
          <button
            onClick={() => {
              if (isLoggedIn()) navigate("/dashboard");
              else setShowLogin(true);
            }}
            className="bg-light-primary hover:bg-light-primaryHover dark:bg-dark-primary dark:hover:bg-dark-primaryHover px-6 py-3 rounded-lg text-white font-semibold text-lg shadow-lg transform hover:scale-105 transition-transform"
          >
            Get Started
          </button>
        </div>
      </div>

      <FirebaseLogin 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onSuccess={handleLoginSuccess} 
      />
    </div>
  );
}

export default Welcome;
