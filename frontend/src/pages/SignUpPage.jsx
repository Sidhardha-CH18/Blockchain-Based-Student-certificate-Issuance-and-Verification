import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

export default function SignUpPage() {
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState(null);
    const [accountName, setAccountName] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function checkMetaMaskConnection() {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        fetchAccountName(accounts[0]);
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
            fetchAccountName(accounts[0]);
        } catch (err) {
            setError("User rejected connection");
        }
    };

    const fetchAccountName = async (account) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const ensName = await provider.lookupAddress(account);
    
            if (ensName) {
                setAccountName(ensName);
            } else {
                setAccountName(""); // Allow manual entry
            }
        } catch (err) {
            console.error("Error fetching account name:", err);
            setAccountName(""); // Default to empty for manual input
        }
    };
    
    const handleSignUp = async () => {
        setError("");
        setSuccessMessage("");

        if (!account) {
            setError("Please connect MetaMask first!");
            return;
        }
        if (!role || !email || !accountName) {
            setError("All fields are required!");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/signup", {
                address: account,
                name: accountName,
                role,
                email,
            });

            setSuccessMessage(`Sign up successful! Your unique ID: ${response.data.uniqueId}`);
        } catch (error) {
            setError(error.response?.data?.error || "Sign up failed");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

            {!account ? (
                <button className="px-4 py-2 bg-green-600 text-white rounded mb-4" onClick={connectMetaMask}>
                    Connect MetaMask
                </button>
            ) : (
                <p className="text-sm text-gray-600 mb-2">Connected: {account}</p>
            )}

            <input className="p-2 border rounded mb-2 w-80 bg-gray-200" disabled value={account || "Not connected"} />
            <input className="p-2 border rounded mb-2 w-80" placeholder="Enter your name" onChange={(e) => setAccountName(e.target.value)} value={accountName}/> 

            <input className="p-2 border rounded mb-2 w-80" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <select className="p-2 border rounded mb-4 w-80" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select Role</option>
                <option value="institution">Institution</option>
                <option value="student">Student</option>
                <option value="verifier">Verifier</option>
            </select>

            <button 
                className={`px-4 py-2 text-white rounded ${loading || !account ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"}`} 
                onClick={handleSignUp} 
                disabled={loading || !account || !role || !email || !accountName}
            >
                {loading ? "Signing Up..." : "Sign Up"}
            </button>

            {error && <p className="mt-2 text-red-600">{error}</p>}
            {successMessage && <p className="mt-2 text-green-600">{successMessage}</p>}
        </div>
    );
}
