import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from './common/Button';
import axios from 'axios';
import {toast} from 'sonner';
import { Toaster } from 'sonner';
export const TamperSignatureModal = ({certificate, onClose }) => {
  const [issuerId, setIssuerId] = useState('');

  const handleTamper = async () => {
    try {
        const response = await axios.post(
          "http://localhost:5000/api/tamper-digital",
          { issuerId,certificateId:certificate.certificateId},
          { headers: { "Content-Type": "application/json" } }
        );
        toast.success(response.data.message);
        onClose();
      } catch (error) {
        console.error("Error fetching shared certificates:", error);
      }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
  
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
  
      {/* Modal */}
      <div className="relative bg-white/90 backdrop-blur-md rounded-lg shadow-lg w-full max-w-md mx-4 border border-red-200 overflow-hidden">
        
        {/* Red Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500 z-10" />
  
        {/* Modal Content */}
        <div className="p-6 pt-8">
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
  
          <h3 className="text-xl font-medium text-gray-800 mb-4 text-center">Tamper Digital Signature</h3>
          <p className="text-sm text-gray-600 mb-2">Enter a fake Issuer ID to simulate tampering.</p>
  
          <input
            type="text"
            className="w-full p-2 border rounded-lg mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Enter Issuer ID"
            value={issuerId}
            onChange={(e) => setIssuerId(e.target.value)}
          />
  
          <Button variant="primary" onClick={handleTamper} fullWidth>
            Tamper Digital Signature
          </Button>
        </div>
      </div>
    </div>
  );
  
};
