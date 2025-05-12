import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Button from './Button';
import axios from "axios";
import { XIcon, CheckIcon } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [userDetails, setUserDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkAccounts = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setConnectedAccounts(accounts);
            setSelectedAccount(accounts[0]);
            await fetchUserDetails(accounts);
          }
        } catch (err) {
          setError("Error checking MetaMask: " + err.message);
        }
      }
    };

    checkAccounts();

    const handleAccountsChanged = async (accounts) => {
      setConnectedAccounts(accounts);
      setSelectedAccount(accounts[0] || '');
      if (accounts.length > 0) {
        await fetchUserDetails(accounts);
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const fetchUserDetails = async (accounts) => {
    try {
      console.log(accounts)
      const response = await axios.post("http://localhost:5000/api/getUsers", {
        addresses: accounts
      });
      setUserDetails(response.data.users || []);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setUserDetails([]);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setError("MetaMask not installed!");
      return;
    }
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setConnectedAccounts(accounts);
      setSelectedAccount(accounts[0]);
      await fetchUserDetails(accounts);
      setShowModal(true);
    } catch (err) {
      setConnectedAccounts([]);
      setSelectedAccount('');
      setUserDetails([]);
      setError("User rejected connection");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!selectedAccount) return;
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/login", { address: selectedAccount });
      if (response.data.role) {
        navigate(`/dashboard/${response.data.role}`, { state: { address: selectedAccount } });
      } else {
        setError("No associated role found. Please sign up.");
        navigate("/signup");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const FeatureIcon = ({ text, children }) => (
    <div className="flex flex-col items-center">
      <div className="text-3xl mb-2 bg-purple-900/30 p-4 rounded-full">{children}</div>
      <span className="text-gray-300">{text}</span>
    </div>
  );

  return (
    <>
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center px-4">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">🧾 Blockchain Certificate System</h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Issue. Share. Verify. Securely on the Blockchain.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              primary
              onClick={connectedAccounts.length > 0 ? () => setShowModal(true) : connectMetaMask}
              disabled={loading}
            >
              {loading
                ? "Connecting..."
                : connectedAccounts.length > 0
                ? "Choose MetaMask Account"
                : "Connect with MetaMask"}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <div className={`mt-16 transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex justify-center space-x-6">
              <FeatureIcon text="Secure">🔒</FeatureIcon>
              <FeatureIcon text="Immutable">⛓️</FeatureIcon>
              <FeatureIcon text="Verifiable">✅</FeatureIcon>
            </div>
          </div>
        </div>
      </section>

      {/* Modal to select account */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-md bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden z-10 animate-modalEntry">
            <div className="relative p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Select MetaMask Account</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <XIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-purple">
              {connectedAccounts.map((acc) => {
                const user = userDetails.find((u) => u.address.toLowerCase() === acc.toLowerCase());
                return (
                  <div
                    key={acc}
                    onClick={() => setSelectedAccount(acc)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                      selectedAccount === acc ? 'bg-purple-900/20 border-l-4 border-purple-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-white font-medium">{user?.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-400">{user?.uniqueId || 'Unknown Id'}</p>
                        <p className="text-sm text-gray-400">{acc}</p>
                      </div>
                      {selectedAccount === acc && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="py-2 px-4 bg-transparent hover:bg-white/5 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleLogin();
                }}
                disabled={!selectedAccount}
                className={`py-2 px-4 rounded-lg transition-colors ${
                  selectedAccount
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;
