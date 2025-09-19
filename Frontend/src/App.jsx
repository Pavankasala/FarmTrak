import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import FeedPredictor from "./pages/FeedPredictor";
import FlockManagement from "./pages/FlockManagement";
import DashboardLayout from "./layout/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";
import ExpenseTracker from "./pages/ExpenseTracker";
import ProductionTracker from "./pages/ProductionTracker";
import RevenueTracker from "./pages/RevenueTracker";

export default function App() {
  return (
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
          <Route path="revenue" element={<RevenueTracker />} />
        </Route>
      </Routes>
    </Router>
  );
}