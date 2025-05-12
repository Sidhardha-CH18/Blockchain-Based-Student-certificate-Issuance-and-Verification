import React, { useEffect, useState } from 'react';
export const VerificationModal = () => {
  const [hashVerified, setHashVerified] = useState(null);
  const [signatureVerified, setSignatureVerified] = useState(null);
  useEffect(() => {
    // Simulate hash verification after 1 second
    const hashTimer = setTimeout(() => {
      setHashVerified(Math.random() > 0.1);
    }, 1000);
    // Simulate signature verification after 2 seconds
    const signatureTimer = setTimeout(() => {
      setSignatureVerified(Math.random() > 0.1);
    }, 2000);
    return () => {
      clearTimeout(hashTimer);
      clearTimeout(signatureTimer);
    };
  }, []);
  return <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative bg-white/90 backdrop-blur-md rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse"></div>
        <div className="p-6">
          <h3 className="text-xl font-medium text-center text-gray-800 mb-6">
            Verifying Data Integrity...
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-700 font-medium">
                  🧬 Hash Integrity
                </span>
              </div>
              <div className="flex items-center">
                {hashVerified === null ? <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-emerald-500 animate-spin"></div> : hashVerified ? <span className="text-emerald-500 font-medium">
                    ✅ check complete
                  </span> : <span className="text-red-500 font-medium">✅ check complete</span>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-700 font-medium">
                  ✍️ Digital Signature
                </span>
              </div>
              <div className="flex items-center">
                {signatureVerified === null ? <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-emerald-500 animate-spin"></div> : signatureVerified ? <span className="text-emerald-500 font-medium">
                    ✅ check complete
                  </span> : <span className="text-red-500 font-medium">✅ check complete</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};