import React,{useEffect,useState} from 'react';
import { 
  LayoutDashboardIcon, 
  FileTextIcon, 
  ShareIcon, 
  HistoryIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
type NavView = 'dashboard' | 'certificates';
type NavAction = 'share' | 'history';

interface SidebarProps {
  expanded: boolean;
  toggleSidebar: () => void;
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  onAction: (action: NavAction) => void;
  address: string;
}

export const Sidebar = ({ 
  expanded, 
  toggleSidebar,
  activeView,
  onNavigate,
  onAction,
  address
}: SidebarProps) => {
  const [name,setName]=useState(null);
  const [id,setId]=useState(null);
    useEffect(() => {
      if (!address) {
        console.error("Institution address not found.");
        return;
      }
      axios
        .post("http://localhost:5000/api/student-dashboard", { address: address }, { headers: { "Content-Type": "application/json" } })
        .then((response) => {
          console.log("Data received:", response.data);
          setId(response.data.id)
          setName(response.data.name);
        })
        .catch((error) => console.error("Error fetching certificates:", error));
    }, [address]);
  const navItems = [
    {
      icon: <LayoutDashboardIcon className="w-5 h-5" />,
      text: 'Dashboard',
      type: 'navigation' as const,
      value: 'dashboard' as NavView,
      active: activeView === 'dashboard'
    },
    {
      icon: <FileTextIcon className="w-5 h-5" />,
      text: 'View Certificates',
      type: 'navigation' as const,
      value: 'certificates' as NavView,
      active: activeView === 'certificates'
    },
    {
      icon: <HistoryIcon className="w-5 h-5" />,
      text: 'Share History',
      type: 'action' as const,
      value: 'history' as NavAction,
      active: false
    }
  ];

  return (
    <aside className={`fixed h-screen bg-[#0a1428]/40 backdrop-blur-xl border-r border-[#2a3a5a] transition-all duration-300 ease-in-out z-20 ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a3a5a]">
          {expanded ? (
            <>
              <Link to='/' className="text-xl font-bold bg-gradient-to-r from-[#ff3e9d] to-[#0edcfb] bg-clip-text text-transparent">
                CertChain
              </Link>
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-[#1a2c4e] transition-colors duration-200 group"
              >
                <ChevronLeftIcon className="w-5 h-5 text-[#ff3e9d] group-hover:text-[#0edcfb]" />
              </button>
            </>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff3e9d] to-[#0edcfb] flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => item.type === 'navigation' 
                    ? onNavigate(item.value) 
                    : onAction(item.value)}
                  className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-300 group relative overflow-hidden
                    ${item.active 
                      ? 'bg-gradient-to-r from-[#ff3e9d]/20 to-[#0edcfb]/10 text-[#ff3e9d]' 
                      : 'hover:bg-[#1a2c4e] text-gray-300 hover:text-white'}`}
                >
                  <div className={`${item.active ? 'text-[#ff3e9d]' : 'text-gray-400 group-hover:text-white'}`}>
                    {item.icon}
                  </div>
                  {expanded && (
                    <span className={`ml-3 ${item.active ? 'font-medium' : ''}`}>
                      {item.text}
                    </span>
                  )}
                  {item.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff3e9d]/10 to-[#0edcfb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section - Profile */}
        <div className="p-4 border-t border-white/10">
          {expanded ? (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-400 flex items-center justify-center text-black font-medium">
                S
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-gray-400">  {id}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[#1a2c4e] transition-all duration-200 text-[#ff3e9d]"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};