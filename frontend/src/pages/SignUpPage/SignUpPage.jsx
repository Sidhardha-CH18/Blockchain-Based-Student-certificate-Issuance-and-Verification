import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Navbar from './Components/Navbar';
import { GlobeIcon, UserIcon, MailIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const roles = ['Institution', 'Student', 'Verifier'];
  const navigate = useNavigate();
  
  const [countdown, setCountdown] = useState(3); // State for countdown
  const [redirecting, setRedirecting] = useState(false); // To track if redirect is happening


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    checkMetaMaskConnection();
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (redirecting && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Clear interval on unmount
    } else if (countdown === 0) {
      navigate('/'); // Redirect after countdown
    }
  }, [redirecting, countdown, navigate]);

  useEffect(() => {
    async function checkMetaMaskConnection() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_accounts" });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    // fetchAccountName(accounts[0]);
                }
            } catch (err) {
                setError("Error checking MetaMask: " + err.message);
            }
        }
    }
    checkMetaMaskConnection();
  }, []);

  const checkMetaMaskConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // fetchAccountName(accounts[0]);
        }
      } catch (err) {
        setError("Error checking MetaMask: " + err.message);
      }
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setError("MetaMask not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setError("");
      console.log(accounts[0])
      // fetchAccountName(accounts[0]);
    } catch (err) {
      setError("User rejected connection");
    }
  };

  // const fetchAccountName = async (account) => {
  //   try {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const ensName = await provider.lookupAddress(account);

  //     if (ensName) {
  //       setAccountName(ensName);
  //     } else {
  //       setAccountName(""); // Allow manual entry
  //     }
  //   } catch (err) {
  //     console.error("Error fetching account name:", err);
  //     setAccountName(""); // Default to empty for manual input
  //   }
  // };

  const handleRoleSelect = (role) => {
    console.log(role)
    setSelectedRole(role);
    setRole(role)
    console.log(selectedRole)
    setIsRoleOpen(false);
  };

  const handleSignUp = async () => {
    console.log("sigin")
    setError("");
    setSuccessMessage("");
    console.log(role,email,accountName)

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
      setRedirecting(true); // Start the redirect countdown
      setCountdown(3); // Set countdown to 3 seconds
    } catch (error) {
      setError(error.response?.data?.error || "Sign up failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
    <Navbar />
    <main className="relative w-full overflow-hidden bg-gradient-to-b from-[#0a0b15] via-[#12162b] to-[#0a0b15] text-white flex-1">
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        <div className="my-14">
        <div className="relative flex justify-center items-center h-full z-10  overflow-hidden">
          <div className={`w-full max-w-md backdrop-blur-md bg-black/30 rounded-lg border border-white/10 shadow-lg overflow-hidden transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ boxShadow: '0 0 40px rgba(255, 255, 255, 0.1)' }}>
            <div className="scanline"></div>
              <div className="p-4 text-center border-b border-white/10">
                  <h1 className="text-2xl font-light text-white tracking-wider mb-1">
                      SIGN <span className="text-cyan-400">UP</span>
                  </h1>
              </div>
            <div className="p-8 space-y-6">
              {!account ? (
                <button onClick={connectMetaMask} className="w-full py-3 px-4 bg-black/40 border border-white/20 hover:border-white/40 rounded-full flex items-center justify-center space-x-3 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] group relative overflow-hidden">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
                  <span className="font-light tracking-wider">CONNECT WITH METAMASK</span>
                </button>
              ) : (
                <p className="text-sm text-white/60 mb-2">Connected: {account}</p>
              )}

              <div className="space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="FULL NAME"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full py-3 pl-10 pr-3 bg-transparent border-b border-white/20 focus:border-white/60 outline-none transition-all duration-300 placeholder-white/30 font-light tracking-wider text-sm"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
                    <MailIcon size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 pl-10 pr-3 bg-transparent border-b border-white/20 focus:border-white/60 outline-none transition-all duration-300 placeholder-white/30 font-light tracking-wider text-sm"
                  />
                </div>

                <div className="relative">
                  <button type="button" onClick={() => setIsRoleOpen(!isRoleOpen)} className="w-full py-3 px-3 bg-transparent border-b border-white/20 hover:border-white/40 flex items-center justify-between transition-all duration-300 font-light tracking-wider text-sm">
                    <span className={selectedRole ? 'text-white' : 'text-white/30'}>
                      {selectedRole || 'SELECT ROLE'}
                    </span>
                    {isRoleOpen ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                  </button>
                  {isRoleOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-black/80 backdrop-blur-md border border-white/10 rounded shadow-lg">
                      <ul className="py-1">
                        {roles.map(role => (
                          <li key={role}>
                            <button
                              type="button"
                              className="block w-full px-4 py-2 text-left hover:bg-white/10 transition-colors duration-200 font-light tracking-wider text-sm"
                              onClick={() => handleRoleSelect(role)}
                            >
                              {role}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>

              <button
                onClick={handleSignUp}
                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-md font-light tracking-widest text-sm transition-all duration-500 relative overflow-hidden group"
                
              >
                <span className="relative z-10">{loading ? "Signing Up..." : (redirecting ? `Redirecting to homepage in ${countdown}s` : "SIGN UP")}</span>
                <span className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <span className="w-0 h-0 rounded-full bg-white/20 absolute group-hover:w-[400%] group-hover:h-[400%] transition-all duration-700"></span>
                </span>
              </button>

              {error && <p className="mt-2 text-red-600 text-sm text-center">{error}</p>}
              {successMessage && <p className="mt-2 text-green-600 text-sm text-center">{successMessage}</p>}
              <p className="text-center text-white/50 text-xs tracking-wider pt-4">
              By signing up, you agree to the Terms of Service and Privacy
              Policy
            </p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
