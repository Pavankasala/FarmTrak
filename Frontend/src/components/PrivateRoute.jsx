// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/login";

/**
 * Protects routes that require authentication.
 * Redirects to "/" if the user is not logged in.
 */
export default function PrivateRoute({ children }) {
  // Check login status from localStorage (isLoggedIn utility)
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
