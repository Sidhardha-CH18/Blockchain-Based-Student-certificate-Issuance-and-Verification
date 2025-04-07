import { useState, useEffect } from "react";
import { ethers } from "ethers";

const MetaMaskAuth = () => {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState("");

    // Check if MetaMask is installed
    const checkMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_accounts" });
                if (accounts.length > 0) {
                    setAccount(accounts[0]); // Auto-connect if already authorized
                }
            } catch (err) {
                setError("Error checking MetaMask: " + err.message);
            }
        } else {
            setError("MetaMask not installed!");
        }
    };

    // Connect MetaMask
    const connectMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAccount(accounts[0]);
                setError("");
            } catch (err) {
                setError("User rejected connection");
            }
        } else {
            setError("MetaMask not installed!");
        }
    };

    useEffect(() => {
        checkMetaMask();
    }, []);

    return (
        <div>
            {account ? (
                <p>✅ Connected: {account}</p>
            ) : (
                <button onClick={connectMetaMask}>Connect MetaMask</button>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default MetaMaskAuth;
