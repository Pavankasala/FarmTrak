import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { apiClient } from "../utils/apiClient";
import { logIn } from "../utils/login";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [tempData, setTempData] = useState(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView("login");
        setEmail(""); setPassword(""); setConfirmPassword(""); setUsername(""); setVerifyCode(""); setError(""); setTempData(null);
      }, 300);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Common styles
  const inputClass = "p-3 w-full rounded-lg border border-light-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary";
  const btnClass = "w-full py-3 font-semibold rounded-lg transition-colors";
  const primaryBtn = btnClass + " bg-light-primary text-white hover:bg-light-primaryHover";

  // Handlers
  const success = (data) => { logIn(data.token, data.email); onSuccess({ token: data.token, email: data.email }); onClose(); };
  const showError = (err, msg) => setError(err.response?.data?.message || msg);

  const handleGoogle = async (cred) => {
    setError("");
    if (!cred?.credential) return;
    try {
      const res = await apiClient.googleLogin(cred.credential);
      res.data.status === "success" ? success(res.data) : showError({ response: { data: res.data } }, "Google login failed");
    } catch (err) { showError(err, "Google login error"); }
  };

  const handleRegister = async () => {
    setError("");
    if (!email || !username || !password || !confirmPassword) return setError("All fields required");
    if (password.length < 6) return setError("Password must be 6+ characters");
    if (password !== confirmPassword) return setError("Passwords don't match");
    try {
      await apiClient.register(email, username, password);
      setTempData({ email, username, password });
      setView("verify");
    } catch (err) { showError(err, "Failed to send code"); }
  };

  const handleVerify = async () => {
    setError("");
    if (!verifyCode) return setError("Enter verification code");
    if (!tempData) return setError("Session expired");
    try {
      const res = await apiClient.verifyAndCreateUser(tempData.email, verifyCode, tempData.username, tempData.password);
      res.data.status === "success" ? success(res.data) : showError(res, "Verification failed");
    } catch (err) { showError(err, "Verification failed"); }
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) return setError("Email and password required");
    try {
      const res = await apiClient.login(email, password);
      res.data.status === "success" ? success(res.data) : showError(res, "Login failed");
    } catch (err) { showError(err, "Login failed"); }
  };

  const goBack = () => {
    setView(view === "verify" ? "signup" : "login");
    setError("");
  };

  const titles = { login: "Welcome Back 👋", signup: "Create Account ✨", verify: "Verify Email 📧" };
  const subtitles = { 
    login: "Sign in with Google or credentials", 
    signup: "Sign up to manage your farm", 
    verify: "Enter the code sent to your email" 
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-light-card dark:bg-dark-card p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-light-border dark:border-dark-border"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center mb-4">
              {view !== "login" && (
                <button onClick={goBack} className="text-light-subtext hover:text-light-text">← Back</button>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2 text-light-text dark:text-dark-text text-center">{titles[view]}</h2>
            <p className="text-sm text-light-subtext dark:text-dark-subtext mb-6 text-center">{subtitles[view]}</p>

            {/* Google Login */}
            {view !== "verify" && (
              <>
                <GoogleLogin onSuccess={handleGoogle} onError={() => setError("Google failed")} theme="filled_blue" shape="pill" width="300px" />
                <div className="my-4 text-xs text-gray-400 uppercase text-center">or</div>
              </>
            )}

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            {/* Forms */}
            <div className="space-y-3">
              {view === "login" && (
                <>
                  <input type="email" placeholder="Email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input type="password" placeholder="Password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button onClick={handleLogin} className={primaryBtn}>Sign In</button>
                  <p className="text-center text-sm text-light-subtext">
                    No account? <button onClick={() => setView("signup")} className="text-light-primary hover:underline font-semibold">Sign Up</button>
                  </p>
                </>
              )}

              {view === "signup" && (
                <>
                  <input type="email" placeholder="Email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input type="text" placeholder="Username" className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
                  <input type="password" placeholder="Password (6+ chars)" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <input type="password" placeholder="Confirm password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <button onClick={handleRegister} className={primaryBtn}>Send Verification Code</button>
                  <p className="text-center text-sm text-light-subtext">
                    Have account? <button onClick={() => setView("login")} className="text-light-primary hover:underline font-semibold">Sign In</button>
                  </p>
                </>
              )}

              {view === "verify" && (
                <>
                  <p className="text-sm text-center text-light-subtext mb-4">Code sent to <strong>{tempData?.email}</strong></p>
                  <input 
                    type="text" placeholder="Enter 6-digit code" className={inputClass + " text-center tracking-widest"} 
                    value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} 
                  />
                  <button onClick={handleVerify} className={btnClass + " bg-green-600 text-white hover:bg-green-700"}>Verify & Create Account</button>
                  <button onClick={handleRegister} className="w-full py-2 text-light-primary hover:underline text-sm">Resend Code</button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}