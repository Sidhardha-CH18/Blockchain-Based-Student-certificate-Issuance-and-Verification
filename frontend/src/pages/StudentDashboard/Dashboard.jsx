import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CertificatesView from './components/CertificatesView';
import { ParticleBackground } from './components/ParticleBackground';
import { useLocation } from 'react-router-dom';

export default function StudentDashboard() {
  const location = useLocation();
  const address = location.state?.address || "";
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleNavigate = (view) => {
    setActiveView(view);
  };

  const handleAction = (action) => {
    switch(action) {
      case 'share':
        console.log("Share action triggered");
        break;
      case 'history':
        console.log("History action triggered");
        break;
      case 'logout':
        console.log("Logout action triggered");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#050b1f] text-white font-['Rajdhani', sans-serif] overflow-hidden">
      <ParticleBackground />
      <div className="flex w-full relative z-10">
        <Sidebar 
          expanded={sidebarExpanded} 
          toggleSidebar={toggleSidebar} 
          activeView={activeView}
          onNavigate={handleNavigate}
          onAction={handleAction}
          address={address}
        />
        <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'} p-6 md:p-8`}>
          {activeView === 'dashboard' ? (
            <Dashboard address={address} 
             onNavigate={handleNavigate}
            />
          ) : (
            <CertificatesView />
          )}
        </main>
      </div>
    </div>
  );
}