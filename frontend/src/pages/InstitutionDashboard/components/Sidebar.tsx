import React from 'react';
import { HomeIcon, FileTextIcon, FolderIcon, LogOutIcon, MenuIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isCollapsed, toggleSidebar, activeView, onNavigate, onAction, className, address }) => {
  const navItems = [
    { icon: <HomeIcon size={20} />, label: 'Dashboard', view: 'dashboard' },
    { icon: <FileTextIcon size={20} />, label: 'Issue Certificate', view: 'issue' },
    { icon: <FolderIcon size={20} />, label: 'View Certificates', view: 'view' },
  ];

  return (
    <aside
      className={`fixed h-full transition-all duration-300 ease-in-out z-20 border-r border-pink-500/20
        ${isCollapsed ? 'w-[80px]' : 'w-[240px]'} ${className}`}
    >
      {/* Base black background */}
      <div className="absolute inset-0 bg-black z-0" />

      {/* Matching Dashboard-style gradient overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,78,194,0.15),transparent_50%)]" />
      </div>

      {/* Sidebar Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 flex items-center border-b border-pink-500/20">
          <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-pink-500/10 transition-colors">
            <MenuIcon size={20} className="text-pink-400" />
          </button>
          {!isCollapsed && (
            <Link to="/" className="ml-3 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent tracking-wide hover:opacity-80 transition-opacity">
              CertSystem
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="mt-6 px-2 flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.view}>
                <a
                  href="#"
                  className={`flex items-center p-3 rounded-lg transition-all duration-200
                    ${activeView === item.view
                      ? 'bg-pink-500/10 text-pink-300'
                      : 'hover:bg-pink-500/5 text-pink-400'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.view);
                  }}
                >
                  <span className="text-pink-400">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="ml-3 tracking-wide">{item.label}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-2 pb-5">
          <a
            href="#"
            className="flex items-center p-3 rounded-lg hover:bg-pink-500/5 text-pink-400 transition-all duration-200"
            onClick={(e) => {
              e.preventDefault();
              onAction('logout');
            }}
          >
            <span className="text-pink-400">
              <LogOutIcon size={20} />
            </span>
            {!isCollapsed && (
              <span className="ml-3 tracking-wide">Logout</span>
            )}
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
