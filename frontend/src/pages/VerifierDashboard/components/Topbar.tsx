import React from 'react';
import { UserCircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
export const Topbar = ({address}) => {
  return <header className="w-full bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to='/' className="text-lg font-medium bg-gradient-to-r from-accent-dark to-primary-dark bg-clip-text text-transparent">
            Verifier Interface
          </Link>
        </div>
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{address}</span>
            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
              <UserCircleIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </header>;
};