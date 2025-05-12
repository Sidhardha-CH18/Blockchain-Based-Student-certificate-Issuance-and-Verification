import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import SignupPage from "../pages/SignUpPage/SignUpPage";
import InstitutionDashboard from "../pages/InstitutionDashboard/InstitutionDashboard";
import IssueCertificate from "../pages/InstitutionDashboard/IssueCertificate";
import StudentDashboard from "../pages/StudentDashboard/Dashboard";
import VerifierDashboard from "../pages/VerifierDashboard/Dashboard";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Institution Dashboard Routes */}
        <Route path="/dashboard/institution" element={<InstitutionDashboard />} />
        <Route path="/dashboard/institution/issue-certificate" element={<IssueCertificate />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} /> 
        <Route path="/dashboard/verifier" element={<VerifierDashboard />} />
      </Routes>
    </Router>
  );
}
