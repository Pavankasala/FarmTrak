// src/pages/Welcome.jsx
import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { logOut, isLoggedIn, logIn } from '../utils/login';
import LoginModal from '../components/LoginModal';

function Welcome() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) navigate('/dashboard');
  }, []);

  // Dark mode effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  function handleLogout() {
    logOut();
    window.location.reload();
  }

  // Call this after successful login
  const handleLoginSuccess = ({ token, email }) => {
    logIn(token, email);   // Save per-user token
    setShowLogin(false);
    navigate('/dashboard');
  };

  return (
    <div className="relative bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen">
      <div className="absolute top-4 right-8 flex items-center gap-3 z-10">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-light-muted dark:hover:bg-dark-dim transition"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-700" />}
        </button>

        {isLoggedIn() ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🔓 Logout
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            🔐 Login
          </button>
        )}
      </div>

      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-5xl font-semibold sm:text-7xl">
          Welcome to <span className="text-light-primary dark:text-dark-primary">FarmTrak</span>
        </h1>
        <p className="mt-6 text-lg text-light-subtext dark:text-dark-subtext">
          Manage your poultry with ease.
        </p>
        <div className="mt-8 flex justify-center gap-x-6">
          <button
            onClick={() => {
              if (isLoggedIn()) navigate('/dashboard');
              else setShowLogin(true);
            }}
            className="bg-light-primary hover:bg-light-primaryHover dark:bg-dark-primary dark:hover:bg-dark-primaryHover px-4 py-2 rounded text-white"
          >
            🧠 Get Started
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess} // Updated
      />
    </div>
  );
}

export default Welcome;
