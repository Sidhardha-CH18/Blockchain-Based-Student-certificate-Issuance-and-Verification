import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { GithubIcon, HomeIcon } from 'lucide-react';
import Button from './Button';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <nav className={`w-full py-4 px-6 transition-all duration-300 ${scrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            CertSystem
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <NavLink href="#about" className="text-base">About</NavLink>
          <NavLink href="#how-it-works" className="text-base">How it Works</NavLink>
          <NavLink href="https://github.com" className="flex items-center text-base">
            <GithubIcon className="w-4 h-4 mr-1" />
            GitHub
          </NavLink>
          <NavLink href="/" className="text-base flex items-center">
            <HomeIcon className="w-4 h-4 mr-1" />
            Home
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children, className = '' }) => {
  return (
    <a 
      href={href} 
      className={`text-gray-200 hover:text-white relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full hover:after:bg-gradient-to-r hover:after:from-red-400 hover:after:to-blue-400 after:transition-all ${className}`}
    >
      {children}
    </a>
  );
};

export default Navbar;
