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
      if (res.data.status === "success") {
        logIn(res.data.token, res.data.email);
        onSuccess({
          token: res.data.token,
          email: res.data.email,
        });
        onClose();
      }
    } catch (err) {
      const message = err.response?.data?.message || "Verification failed";
      console.error("Verification error:", err);
      alert(message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-light-card dark:bg-dark-card p-8 rounded-2xl w-full max-w-sm flex flex-col items-center shadow-2xl relative border border-light-border dark:border-dark-border"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2 text-light-text dark:text-dark-text text-center">
              Welcome Back 👋
            </h2>

            <p className="text-sm text-light-subtext dark:text-dark-subtext mb-6 text-center">
              Sign in with Google or verify your email manually.
            </p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google login failed")}
              ux_mode="popup"
              theme="filled_blue"
              shape="pill"
              width="300px"
            />
            
            <div className="my-4 text-xs text-gray-400 uppercase w-full text-center">or</div>

            {!isVerificationSent ? (
              <>
                <input
                  type="email"
                  placeholder="Your email"
                  className="mb-2 p-3 w-full rounded-lg border border-light-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Your username"
                  className="mb-3 p-3 w-full rounded-lg border border-light-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button
                  onClick={handleSendVerification}
                  className="w-full py-3 bg-light-primary text-white font-semibold rounded-lg hover:bg-light-primaryHover dark:bg-dark-primary dark:hover:bg-dark-primaryHover transition-colors"
                >
                  Send Verification Code
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter verification code"
                  className="mb-3 p-3 w-full rounded-lg border border-light-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                />
                <button
                  onClick={handleVerifyEmail}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Verify Email
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="mt-4 text-sm text-light-subtext dark:text-dark-subtext hover:underline"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}