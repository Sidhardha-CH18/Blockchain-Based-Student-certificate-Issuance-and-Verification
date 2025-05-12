import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from './common/Button';
import axios from 'axios';
import {toast} from 'sonner';
import { Toaster } from 'sonner';
export const TamperContentModal = ({ certificateData,certificate, onClose }) => {
  console.log(certificateData)
  const [editedData, setEditedData] = useState(JSON.stringify(certificateData, null, 2));

  const handleTamper = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/tamper-content",
        { editedData: JSON.parse(editedData), 
          certificateId: certificate.certificateId,
          verifierId: certificate.verifierId,},
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success(response.data.message);
      
      onClose();
    } catch (error) {
      console.error('Tamper request failed:', error);
    }
  };
  



  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <Toaster position="top-right" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
  
      {/* Modal Container */}
      <div className="relative bg-white/90 backdrop-blur-md rounded-lg shadow-lg w-full max-w-2xl mx-4 border border-yellow-200 overflow-hidden">
  
        {/* Yellow Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500 z-10" />
  
        {/* Modal Content */}
        <div className="p-6 pt-8">
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
  
          <h3 className="text-xl font-medium text-gray-800 mb-4 text-center">Tamper Certificate Content</h3>
          <p className="text-sm text-gray-600 mb-2">Edit certificate content below:</p>
  
          <textarea
            className="w-full h-60 p-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={editedData}
            onChange={(e) => setEditedData(e.target.value)}
          />
  
          <div className="mt-4">
            <Button variant="primary" onClick={handleTamper} fullWidth>
              Tamper Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
  
};
