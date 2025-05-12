import React from 'react';

const LoaderModal = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center space-y-12"> {/* Add space between elements */}
        {/* Animation Elements */}
        <div className="relative flex justify-center items-center">
          <div className="absolute">
            <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-cyan-500 animate-spin"></div>
          </div>
          <div className="absolute">
            <div className="h-16 w-16 rounded-full border-r-4 border-l-4 border-purple-500 animate-spin animate-delay-150"></div>
          </div>
        </div>

        {/* Text positioned below the animation */}
        <p className="text-cyan-400 text-sm animate-pulse">
          Decrypting Certificate Data...
        </p>
      </div>
    </div>
  );
};

export default LoaderModal;
