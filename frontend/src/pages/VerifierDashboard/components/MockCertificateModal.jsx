import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from './common/Button';

export const MockCertificateModal = ({ onClose, onSelectTamperType }) => {
  const [tamperOption, setTamperOption] = useState('');

  const handleContinue = () => {
    if (!tamperOption) return;
  
    onClose(); // close this modal
  
    if (tamperOption === 'signature') {
      onSelectTamperType('signature');
    } else {
      onSelectTamperType('content');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white/90 backdrop-blur-md rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden border border-blue-200">
        <div className="h-2 bg-blue-500" />
        <div className="p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-medium text-gray-800">
              Mock Certificate Options
            </h3>
            <p className="text-gray-600 mt-2">
              Select how you'd like to tamper the certificate.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="tamper"
                value="signature"
                checked={tamperOption === 'signature'}
                onChange={() => setTamperOption('signature')}
                className="form-radio text-blue-600"
              />
              <span className="text-sm text-gray-700">
                Tamper Digital Signature
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="tamper"
                value="content"
                checked={tamperOption === 'content'}
                onChange={() => setTamperOption('content')}
                className="form-radio text-blue-600"
              />
              <span className="text-sm text-gray-700">
                Tamper Certificate Content
              </span>
            </label>
          </div>

          <Button variant="primary" onClick={handleContinue} fullWidth>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
