// src/utils/login.js

const getEmailKey = () => {
  const userKey = Object.keys(localStorage).find(key => key.startsWith('farmtrak-user-'));
  return userKey ? localStorage.getItem(userKey) : null;
};

// Save token & user email
export const logIn = (token, email) => {
  if (!email) return;
  localStorage.setItem(`farmtrak-token-${email}`, token);
  localStorage.setItem(`farmtrak-user-${email}`, email);
};

// Clear all session-related items
export const logOut = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith('farmtrak-'))
    .forEach(key => localStorage.removeItem(key));
};

// Get the currently logged-in user's email
export const getCurrentUser = () => {
  return getEmailKey();
};

// Check if a token exists for any user
export const isLoggedIn = () => {
  return !!getToken();
};

// Get the token for the currently logged-in user
export const getToken = () => {
  const email = getEmailKey();
  return email ? localStorage.getItem(`farmtrak-token-${email}`) : null;
};