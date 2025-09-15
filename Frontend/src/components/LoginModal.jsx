import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { apiClient } from "../utils/apiClient";
import { logIn } from "../utils/login";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;

    try {
      const res = await apiClient.googleLogin(credentialResponse.credential);

      if (res.data.status === "success") {
        logIn(res.data.token, res.data.email);
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

  const handleSendVerification = async () => {
    try {
      await apiClient.sendVerification(email, username);
      setIsVerificationSent(true);
    } catch (err) {
      console.error("Verification sending error:", err);
      alert("Failed to send verification code");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const res = await apiClient.verifyEmail(email, verifyCode);
      if (res.data.verified) {
        alert("Email verified successfully!");
        onClose();
      } else {
        alert("Invalid verification code.");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Verification failed");
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
              Sign in with Google or verify your email manually.
            </p>

            {/* Google Login */}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google login failed")}
              ux_mode="popup"
            />

            {/* Manual Email Verification */}
            {!isVerificationSent ? (
              <>
                <input
                  type="email"
                  placeholder="Your email"
                  className="my-2 p-2 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Your username"
                  className="my-2 p-2 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button
                  onClick={handleSendVerification}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Verification Code
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter verification code"
                  className="my-2 p-2 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                />
                <button
                  onClick={handleVerifyEmail}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Verify Email
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
