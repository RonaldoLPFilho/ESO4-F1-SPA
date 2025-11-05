import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import { Navigation } from "./components/Nav";
import AlertsPage from "./pages/Alerts";

export default function AppRoutes() {
    return (
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </BrowserRouter>
    )
  }