// src/utils/login.js

// Save user email (non-sensitive data only)
export const logIn = (token, email) => {
  if (!email) return;
  localStorage.setItem('farmtrak-user-email', email);
  // Token is automatically handled by cookies
};

// Clear session data
export const logOut = async () => {
  localStorage.removeItem('farmtrak-user-email');
  // Cookie will be cleared by the backend
  try {
    await fetch('https://farmtrak.onrender.com/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Get the currently logged-in user's email
export const getCurrentUser = () => {
  return localStorage.getItem('farmtrak-user-email');
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!getCurrentUser();
};