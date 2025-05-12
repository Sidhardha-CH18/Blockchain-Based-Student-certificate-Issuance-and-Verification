import { React, useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { UserIcon } from 'lucide-react';
import {FileIcon, FileTextIcon,ShareIcon, SearchIcon,FolderIcon,RocketIcon } from 'lucide-react';
import axios from 'axios';

export default function Dashboard({ address,onNavigate }) {
  const [name, setName] = useState(null);
  const [id, setId] = useState(null);
  const [sharedCount,setSharedCount]=useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const studentAddress = address;

  useEffect(() => {
    if (!studentAddress) {
      console.error("Institution address not found.");
      return;
    }
    axios
      .post("http://localhost:5000/api/student-dashboard", { address: studentAddress }, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        console.log("Data received:", response.data);
        setId(response.data.id);
        setName(response.data.name);
        setSharedCount(response.data.sharedCount)
        setCertificateCount(response.data.certificatesIssued);
      })
      .catch((error) => console.error("Error fetching certificates:", error));
  }, [studentAddress]);

  const stats = [
    {
      title: 'Total Certificates',
      value: certificateCount,
      icon: <FileIcon size={24} />,
      color: 'from-[#0edcfb] to-[#0ea5fb]'
    },
    {
      title: 'Certificates Shared',
      value: sharedCount,
      icon: <ShareIcon size={24} />,
      color: 'from-[#ff3e9d] to-[#ff7e6c]'
    }
  ];

  const actions = [
    {
      title: 'View Certificates',
      icon: <SearchIcon size={24} />,
      color: 'from-[#0edcfb] to-[#0ea5fb]'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <div className="relative bg-[#0f1b38] bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-[#2a3a5a] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-r from-[#ff3e9d] to-[#0edcfb] opacity-10 blur-2xl" />
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#ff3e9d] to-[#0edcfb] flex items-center justify-center mr-5">
              <UserIcon size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Welcome back, {name}</h2>
              <p className="text-gray-400">
                Your certificates are secure and ready to share
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#0f1b38] bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-[#2a3a5a] transition-transform duration-300 hover:transform hover:scale-[1.02]">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mr-4`}>
                {stat.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-300">{stat.title}</h3>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => onNavigate('certificates')}
          className="flex items-center justify-center space-x-3 px-6 py-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
        >
          <FileTextIcon className="w-5 h-5" />
          <span>View Certificates</span>
        </button>
        <button onClick={() => onNavigate('certificates')} className="flex items-center justify-center space-x-3 px-6 py-4 rounded-lg border border-pink-500/20 text-pink-300 hover:bg-pink-500/10 transition-colors">
          <ShareIcon className="w-5 h-5" />
          <span>Share Certificate</span>
        </button>
      </div>
    </div>
  );
}