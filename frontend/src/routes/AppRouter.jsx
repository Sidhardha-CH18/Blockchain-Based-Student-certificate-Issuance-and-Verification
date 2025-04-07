import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignUpPage";
import Dashboard from "../pages/InstitutionDashboard/Dashboard";
import IssueCertificate from "../pages/InstitutionDashboard/IssueCertificate";
import StudentDashboard from "../pages/StudentDashboard/Dashboard";
import VerifierDashboard from "../pages/VerifierDashboard/Dashboard";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Institution Dashboard Routes */}
        <Route path="/dashboard/institution" element={<Dashboard />} />
        <Route path="/dashboard/institution/issue-certificate" element={<IssueCertificate />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} /> 
        <Route path="/dashboard/verifier" element={<VerifierDashboard />} />
      </Routes>
    </Router>
  );
}
