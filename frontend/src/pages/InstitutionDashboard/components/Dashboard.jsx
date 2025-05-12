import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  RocketIcon, FolderIcon, FileTextIcon, LinkIcon,
  HomeIcon
} from 'lucide-react';
import axios from 'axios';
import IssueCertificate from '../IssueCertificate';

const Dashboard = ({ address,onClick }) => {
  const [name, setName] = useState(null);
  const [id, setId] = useState(null);
  const [certificateCount, setCertificateCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!address) {
      console.error("Institution address not found.");
      return;
    }

    axios
      .post("http://localhost:5000/api/institute-dashboard", { 
        address: address 
      }, { 
        headers: { "Content-Type": "application/json" } 
      })
      .then((response) => {
        setId(response.data.id);
        setName(response.data.name);
        setCertificateCount(response.data.certificatesIssued);
      })
      .catch((error) => {
        console.error("Error fetching certificates:", error);
      });
  }, [address]);

  const handleNavClick = (view) => {
    navigate(view);
  };

  return (
    <div className="relative  w-full bg-black">
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,78,194,0.15),transparent_50%)]" />
      </div>

      <div className="relative z-10 ">
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-pink-300 tracking-wider">
                Welcome, {name}
              </h1>
              <p className="text-pink-300/60 mt-2">
                Access your blockchain certification control center
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="backdrop-blur-md bg-pink-500/5 border border-pink-500/20 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <FileTextIcon className="w-8 h-8 text-pink-500" />
                  <div>
                    <div className="text-sm text-pink-300/60">Certificates Issued</div>
                    <div className="text-2xl font-bold text-pink-300">{certificateCount}</div>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-md bg-pink-500/5 border border-pink-500/20 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <LinkIcon className="w-8 h-8 text-pink-500" />
                  <div>
                    <div className="text-sm text-pink-300 /60">Blockchain Sync</div>
                    <div className="text-2xl font-bold text-pink-300">Active</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={onClick}
                className="flex items-center justify-center space-x-3 px-6 py-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
              >
                <RocketIcon className="w-5 h-5" />
                <span>Issue New Certificate</span>
              </button>
              <button className="flex items-center justify-center space-x-3 px-6 py-4 rounded-lg border border-pink-500/20 text-pink-300 hover:bg-pink-500/10 transition-colors">
                <FolderIcon className="w-5 h-5" />
                <span>View Issued</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;