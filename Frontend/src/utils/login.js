// src/utils/login.js

// Save token & user per email
export const logIn = (token, email) => {
  localStorage.setItem(`farmtrak-token-${email}`, token);
  localStorage.setItem(`farmtrak-user-${email}`, email);
};

// Remove token & user per email
export const logOut = () => {
  // Remove all farmtrak-related keys
  Object.keys(localStorage)
    .filter(key => key.startsWith('farmtrak-'))
    .forEach(key => localStorage.removeItem(key));
};

// Get current user dynamically
export const getCurrentUser = () => {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('farmtrak-user-'));
  return allKeys.length ? localStorage.getItem(allKeys[0]) : "";
};

// Check if logged in (checks any token exists)
export const isLoggedIn = () => {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('farmtrak-token-'));
  return allKeys.length > 0;
};

// Get token for a specific email (useful for API calls)
export const getToken = (email) => localStorage.getItem(`farmtrak-token-${email}`) || null;
