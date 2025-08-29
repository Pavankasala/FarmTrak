// src/utils/login.js

// Save token & user email
export const logIn = (token, email) => {
  localStorage.setItem(`farmtrak-token-${email}`, token);
  localStorage.setItem(`farmtrak-user-${email}`, email);
};

export const logOut = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith('farmtrak-'))
    .forEach(key => localStorage.removeItem(key));
};

export const getCurrentUser = () => {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('farmtrak-user-'));
  return allKeys.length ? localStorage.getItem(allKeys[0]) : "";
};

export const isLoggedIn = () => {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('farmtrak-token-'));
  return allKeys.length > 0;
};

export const getToken = (email) => localStorage.getItem(`farmtrak-token-${email}`) || null;

window.onerror = function(message, source, lineno, colno, error) {
  console.error('Unhandled error caught by window.onerror:', {
    message,
    source,
    lineno,
    colno,
    error: error ? error.stack : 'No error object'
  });
  return true; // prevent default handling
};
