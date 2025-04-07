import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract institution address from router state
  const institutionAddress = location.state?.address || "";

  if (!institutionAddress) {
    alert("Institution address not found. Please login again.");
    navigate("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Institution Dashboard</h1>

      <Button 
        className="mb-4" 
        onClick={() => navigate("/dashboard/institution/issue-certificate", { state: { address: institutionAddress } })}
      >
        Issue Certificate
      </Button>

      {/* More dashboard features can be added here */}
    </div>
  );
}
