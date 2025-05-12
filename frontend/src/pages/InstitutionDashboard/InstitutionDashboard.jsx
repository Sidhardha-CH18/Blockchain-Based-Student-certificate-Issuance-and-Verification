import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import IssueCertificate from './IssueCertificate';
import { useLocation } from 'react-router-dom';
import { LogOutIcon } from 'lucide-react';

const InstitutionDashboard = () => {
  const location = useLocation();
  const address = location.state?.address || "";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleNavigate = (view) => setActiveView(view);

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard address={address} onClick={() => setActiveView('issue')}/>;
      case 'issue':
        return <IssueCertificate institutionAddress={address} onBack={() => setActiveView('dashboard')} />;
      case 'view':
        return <div>View certificate</div>;
      // add other cases as needed
      default:
        return <Dashboard address={address} />;
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#0b0b0f] text-white">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        onNavigate={handleNavigate}
        onAction={handleLogout}
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out 
          ${isCollapsed ? 'w-[80px]' : 'w-[240px]'}`}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-[80px]' : 'ml-[240px]'}`}>
        {/* Top Bar */}
        <div className={`fixed top-0 left-0 right-0 z-50  px-6 py-4 backdrop-blur-md border-b border-pink-500/20 transition-all duration-300 ease-in-out`} style={{ left: isCollapsed ? '80px' : '240px' }}>
          <div className="flex items-center justify-between">
            <Link to="/" className="text-pink-500 font-mono text-xl tracking-wider transition-colors">
              Blockchain Certificate System
            </Link>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20">
                <span className="text-pink-300 font-mono">{address}</span>
              </div>
              <button 
                className="p-2 hover:bg-pink-500/10 rounded-full transition-colors"
                onClick={handleLogout}
              >
                <LogOutIcon className="w-5 h-5 text-pink-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="pt-16 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default InstitutionDashboard;