import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // Connect to MetaMask & authenticate user
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAddress(accounts[0]);

        // Verify user from backend
        const response = await fetch(`http://localhost:5000/api/login?address=${accounts[0]}`);
        const data = await response.json();

        if (response.ok) {
          setRole(data.role);
          alert(`Login Successful! Role: ${data.role}`);
          navigate(`/${data.role}`);
        } else {
          alert("User not registered. Please sign up.");
          navigate("/signup");
        }
      } catch (error) {
        console.error("MetaMask connection failed:", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <Button onClick={connectWallet}>
        {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Connect MetaMask"}
      </Button>
    </div>
  );
}
