// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/login";

/**
 * Protects routes that require authentication.
 * Redirects to "/" if the user is not logged in.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected component(s)
 */
export default function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/" replace />;
}
