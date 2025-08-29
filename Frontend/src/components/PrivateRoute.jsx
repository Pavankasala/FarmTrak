// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/login';

export default function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
