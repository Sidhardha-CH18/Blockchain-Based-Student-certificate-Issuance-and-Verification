// Sidebar.jsx
import React from 'react';
import { 
  HomeIcon, FileTextIcon, FolderIcon, SettingsIcon, LogOutIcon, MenuIcon 
} from 'lucide-react';

const Sidebar = ({
  isCollapsed,
  toggleSidebar,
  navItems,
  navigate,
  institutionAddress
}) => {
  return (
    <aside className={`fixed h-full transition-all duration-300 ease-in-out z-10 bg-black backdrop-blur-xl border-r border-white/20 
      ${isCollapsed ? 'w-[80px]' : 'w-[240px]'}`} style={{
      boxShadow: '0 0 20px rgba(251, 214, 227, 0.3)',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(251,214,227,0.1) 100%)'
    }}>
      <div className="p-4 flex items-center border-b border-white/10">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <MenuIcon size={20} className="text-white" />
        </button>
        {!isCollapsed && <h1 className="ml-3 text-lg font-semibold bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent">
          CertSystem
        </h1>}
      </div>
      <nav className="mt-6 px-2">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <button 
                onClick={() => navigate(item.href, { state: { address: institutionAddress } })}
                className={`flex items-center p-3 rounded-lg transition-all duration-200
                  ${item.active ? 'bg-pink-50/20 text-white' : 'hover:bg-white/5 text-gray-300'}
                `}>
                <span className={`${item.active ? 'text-pink-500' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="ml-3 transition-opacity duration-200">
                  {item.label}
                </span>}
              </button>
            </li>
          ))}
        </ul>
x      </nav>
      <div className="absolute bottom-0 w-full px-2 pb-5">
        <button className="flex items-center p-3 rounded-lg hover:bg-white/5 text-gray-300 transition-all duration-200">
          <span className="text-gray-400">
            <LogOutIcon size={20} />
          </span>
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;