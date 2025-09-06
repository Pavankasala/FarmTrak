// src/components/LoginModal.jsx
import { AnimatePresence, motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "../utils/api";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  // ✅ handle the Google login response
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/google-login", {
        token: credentialResponse.access_token,
      });
      onSuccess(res.data); // pass token + email back to parent (Welcome.jsx)
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Google login failed. Please try again.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => alert("Google login failed"),
  });

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
            className="bg-light-bg dark:bg-dark-card p-6 rounded-2xl w-80 flex flex-col items-center shadow-2xl relative"
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text text-center">
              Welcome Back 👋
            </h2>
            <p className="text-sm text-light-subtext dark:text-dark-subtext mb-4 text-center">
              Sign in with Google to access your FarmTrak dashboard.
            </p>

            {/* ✅ Custom Google Styled Button */}
            <button
              onClick={() => googleLogin()}
              className="flex items-center gap-2 w-full justify-center px-4 py-2 bg-white border rounded-lg shadow-md hover:bg-gray-100 transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
            </button>

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
