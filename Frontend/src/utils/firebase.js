import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDApUwWI-KcL00w1oIfvopttzDxQG2mPgA",
  authDomain: "farmtrak-d963f.firebaseapp.com",
  projectId: "farmtrak-d963f",
  storageBucket: "farmtrak-d963f.firebasestorage.app",
  messagingSenderId: "97993700630",
  appId: "1:97993700630:web:42d670d8a838df2f6d4c37",
  measurementId: "G-4N1SECLGGB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();