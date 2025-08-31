// Frontend/src/components/LoginModal.jsx
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/google-login`, {
        token: credentialResponse.credential,
      });

      if (res.data.status === "success") {
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("token", res.data.token);

        onSuccess({
          token: res.data.token,
          email: res.data.email,
        });

        onClose();
      } else {
        alert("Google login failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login error: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-bg bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-light-bg dark:bg-dark-bg p-6 rounded-lg w-80 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text text-center">
          Login with Google
        </h2>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google login failed")}
          ux_mode="redirect"
          login_uri="https://farmtrak-backend.onrender.com/api/google-login"
        />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-light-primary dark:bg-dark-primary text-light-bg dark:text-dark-text rounded hover:bg-light-primaryHover dark:hover:bg-dark-primaryHover"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
