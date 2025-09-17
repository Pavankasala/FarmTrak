import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { apiClient } from "../utils/apiClient";
import { logIn } from "../utils/login";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [view, setView] = useState("login"); // 'login' or 'signup'
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [error, setError] = useState("");

  // Reset form state when view changes or modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView("login");
        setEmail("");
        setUsername("");
        setVerifyCode("");
        setIsVerificationSent(false);
        setError("");
      }, 300); // Delay reset to allow exit animation
    }
  }, [isOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleApiSuccess = (data) => {
    logIn(data.token, data.email);
    onSuccess({ token: data.token, email: data.email });
    onClose();
  };

  const handleApiError = (err, defaultMessage) => {
    const message = err.response?.data?.message || defaultMessage;
    console.error("API Error:", err);
    setError(message);
  };
  
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    if (!credentialResponse?.credential) return;
    try {
      const res = await apiClient.googleLogin(credentialResponse.credential);
      if (res.data.status === "success") {
        handleApiSuccess(res.data);
      } else {
        handleApiError({ response: { data: res.data } }, "Google login failed");
      }
    } catch (err) {
      handleApiError(err, "Google login error");
    }
  };

  // SIGN UP: Step 1 - Send OTP
  const handleSendVerification = async () => {
    setError("");
    if (!email || !username) return setError("Email and username are required.");
    try {
      await apiClient.register(email, username);
      setIsVerificationSent(true);
    } catch (err) {
      handleApiError(err, "Failed to send verification code.");
    }
  };

  // SIGN UP: Step 2 - Verify OTP and Create User
  const handleVerifyAndCreateUser = async () => {
    setError("");
    if (!verifyCode) return setError("Please enter the verification code.");
    try {
      const res = await apiClient.verifyAndCreateUser(email, verifyCode, username);
      if (res.data.status === "success") {
        handleApiSuccess(res.data);
      }
    } catch (err) {
      handleApiError(err, "Verification failed.");
    }
  };

  // SIGN IN: Direct login for existing users
  const handleLogin = async () => {
    setError("");
    if (!email) return setError("Email is required.");
    try {
      const res = await apiClient.login(email);
      if (res.data.status === "success") {
        handleApiSuccess(res.data);
      }
    } catch (err) {
      handleApiError(err, "Login failed.");
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
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
              {view === 'login' ? "Welcome Back 👋" : "Create Account ✨"}
            </h2>
            <p className="text-sm text-light-subtext dark:text-dark-subtext mb-6 text-center">
              {view === 'login' ? "Sign in with Google or your email." : "Sign up to start managing your farm."}
            </p>

            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google login failed")} theme="filled_blue" shape="pill" width="300px" />
            <div className="my-4 text-xs text-gray-400 uppercase w-full text-center">or</div>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <AnimatePresence mode="wait">
              {view === "login" ? (
                <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full space-y-3">
                  <input type="email" placeholder="Your email" className="p-3 w-full rounded-lg border border-light-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button onClick={handleLogin} className="w-full py-3 bg-light-primary text-white font-semibold rounded-lg hover:bg-light-primaryHover dark:bg-dark-primary dark:hover:bg-dark-primaryHover transition-colors">Sign In</button>
                  <p className="text-center text-sm text-light-subtext dark:text-dark-subtext">
                    No account?{" "}
                    <button onClick={() => setView("signup")} className="font-semibold text-light-primary dark:text-dark-primary hover:underline">Sign Up</button>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full space-y-3">
                  {!isVerificationSent ? (
                    <>
                      <input type="email" placeholder="Your email" className="p-3 w-full rounded-lg border border-light-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <input type="text" placeholder="Your username" className="p-3 w-full rounded-lg border border-light-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text" value={username} onChange={(e) => setUsername(e.target.value)} />
                      <button onClick={handleSendVerification} className="w-full py-3 bg-light-primary text-white font-semibold rounded-lg hover:bg-light-primaryHover dark:bg-dark-primary dark:hover:bg-dark-primaryHover transition-colors">Send Verification Code</button>
                    </>
                  ) : (
                    <>
                      <input type="text" placeholder="Enter verification code" className="p-3 w-full rounded-lg border border-light-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
                      <button onClick={handleVerifyAndCreateUser} className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">Verify & Sign Up</button>
                    </>
                  )}
                  <p className="text-center text-sm text-light-subtext dark:text-dark-subtext">
                    Already have an account?{" "}
                    <button onClick={() => setView("login")} className="font-semibold text-light-primary dark:text-dark-primary hover:underline">Sign In</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}