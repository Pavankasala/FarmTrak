// src/components/LoginModal.jsx
import React, { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  // ✅ Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // ✅ Handle Google success
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;

    try {
      const res = await api.post("/google-login", {
        token: credentialResponse.credential,
      });

      if (res.data.status === "success") {
        // Save session in localStorage
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("token", res.data.token);

        // Notify parent
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-80 flex flex-col items-center shadow-2xl relative border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 text-center">
              Welcome Back 👋
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Sign in with Google to access your FarmTrak dashboard.
            </p>

            {/* ✅ Google Login Button */}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google login failed")}
              ux_mode="popup"
            />

            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:bg-light-primaryHover dark:hover:bg-dark-primaryHover transition"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
