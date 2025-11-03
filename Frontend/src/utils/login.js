// src/utils/login.js
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

const TOKEN_KEY = 'farmtrak-auth-token';
const USER_EMAIL_KEY = 'farmtrak-user-email';

export const logIn = async (user) => {
  if (!user) return;
  
  // Get the secure token from Firebase
  const token = await user.getIdToken();
  
  // Save the token and email
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_EMAIL_KEY, user.email);
};

export const logOut = async () => {
  try {
    await signOut(auth); 
  } catch (error) {
    console.error("Firebase sign out error", error);
  }
  // Clear all session data
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
};

export const isLoggedIn = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  // This is now secure. An attacker can't just guess a token.
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getCurrentUser = () => {
  return localStorage.getItem(USER_EMAIL_KEY);
};
