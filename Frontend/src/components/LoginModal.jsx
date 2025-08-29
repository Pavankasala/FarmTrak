// Frontend/src/components/LoginModal.jsx
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_BASE_URL } from "../utils/api"; // <-- import centralized API URL

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/google-login`, {
        token: credentialResponse.credential,
      });

      if (res.data.status === "success") {
        // ✅ Store email and token in localStorage
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("token", res.data.token);

        // Call parent success callback
        onSuccess({
          token: res.data.token,
          email: res.data.email,
        });

        onClose(); // close modal after successful login
      } else {
        alert("Google login failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login error: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4 text-center">Login with Google</h2>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google login failed")}
        />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
