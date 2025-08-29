window.onerror = function(message, source, lineno, colno, error) {
  console.error('Unhandled error caught by window.onerror:', {
    message,
    source,
    lineno,
    colno,
    error: error ? error.stack : 'No error object'
  });
  // Return true to prevent the default browser error handling
  return true;
};

// src/App.jsx
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import FeedPredictor from './pages/FeedPredictor';
import FlockManagement from './pages/FlockManagement';
import DashboardLayout from './layout/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import ExpenseTracker from './pages/ExpenseTracker';
import ProductionTracker from './pages/ProductionTracker';
import ThemeProvider, { useTheme } from './components/ThemeProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '1091305199358-8dmcca126f88clk710fkvkmu5r5l08ap.apps.googleusercontent.com';

export default function App() {
  const { theme } = useTheme() || {}; // fallback in case context is not ready

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="feed" element={<FeedPredictor />} />
              <Route path="flock" element={<FlockManagement />} />
              <Route path="expenses" element={<ExpenseTracker />} />
              <Route path="eggs" element={<ProductionTracker />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
