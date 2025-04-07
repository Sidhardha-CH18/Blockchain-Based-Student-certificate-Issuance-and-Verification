import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function LandingPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  

  useEffect(() => {
    async function checkMetaMaskConnection() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            handleLogin(accounts[0]);
          }
        } catch (err) {
          setError("Error checking MetaMask: " + err.message);
        }
      }
    }
    checkMetaMaskConnection();
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setError("MetaMask not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setError("");
      handleLogin(accounts[0]);
    } catch (err) {
      setError("User rejected connection");
    }
  };

  const handleLogin = async (walletAddress) => {
    try {
      const response = await axios.post("http://localhost:5000/login", { address: walletAddress });

      if (response.data.role) {
        navigate(`/dashboard/${response.data.role}`, { state: { address: walletAddress }});
      } else {
        setError("No associated role found. Please sign up.");
        navigate("/signup");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Blockchain Certificate Verification</h1>

      <Button className="p-4 text-lg" onClick={connectMetaMask}>
        {account ? "Redirecting..." : "Login with MetaMask"}
      </Button>

      <Button className="mt-6" onClick={() => navigate("/signup")}>
        Sign Up
      </Button>

      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
