import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function FirebaseLogin({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = isLogin 
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);
      
      // Pass Firebase user data to onSuccess
      onSuccess({ 
        token: await result.user.getIdToken(),
        email: result.user.email,
        user: result.user 
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onSuccess({ 
        token: await result.user.getIdToken(),
        email: result.user.email,
        user: result.user 
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return setError('Enter your email first');
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-light-card dark:bg-dark-card p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-light-border dark:border-dark-border"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text text-center">
              {isLogin ? 'Welcome Back! 👋' : 'Create Account ✨'}
            </h2>

            {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary"
                required
              />
              
              <button 
                type="submit" 
                className="w-full bg-light-primary dark:bg-dark-primary text-white p-3 rounded-lg hover:bg-light-primaryHover dark:hover:bg-dark-primaryHover font-semibold"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <button 
              onClick={handleGoogleLogin}
              className="w-full mt-3 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 font-semibold"
            >
              Continue with Google
            </button>

            <div className="mt-4 text-center space-y-2">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-light-primary dark:text-dark-primary hover:underline font-semibold"
              >
                {isLogin ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
              </button>
              
              {isLogin && (
                <button 
                  onClick={handlePasswordReset}
                  className="block text-sm text-light-subtext dark:text-dark-subtext hover:underline mx-auto"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}