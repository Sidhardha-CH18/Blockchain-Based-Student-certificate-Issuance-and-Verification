// AppLayout.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import  IssueCertificate from '../IssueCertificate';

const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'issue':
        return <IssueCertificate />;
      // Add these as you build them:
      case 'view':
        return <div>View Certificates</div>;
      case 'verifiers':
        return <div>Verifiers</div>;
      default:
        return <div>Not Found</div>;
    }
  };

  const handleAction = (action: string) => {
    if (action === 'logout') {
      // Add logout logic
      console.log('Logging out...');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-white">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        onNavigate={setActiveView}
        onAction={handleAction}
      />
      <main className="flex-1 overflow-auto p-6">
        {renderView()}
      </main>
    </div>
  );
};

export default AppLayout;
