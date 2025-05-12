import React, { useState } from 'react';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  XIcon,
  ChevronDownIcon
} from 'lucide-react';
import { Button } from './common/Button';

export const ResultModal = ({ result, onClose, onViewCertificate }) => {
  const [isInstitutionExpanded, setIsInstitutionExpanded] = useState(false);
  const isSuccessful = result.hashIntegrity && result.digitalSignature;

  const toggleInstitutionExpand = () => {
    setIsInstitutionExpanded((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div
        className={`relative bg-white/90 backdrop-blur-md rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden border ${
          isSuccessful ? 'border-emerald-200' : 'border-red-200'
        }`}
      >
        <div className={`h-2 ${isSuccessful ? 'bg-emerald-500' : 'bg-red-500'}`} />
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
            {isSuccessful ? (
              <CheckCircleIcon className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            ) : (
              <AlertCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h3 className="text-xl font-medium text-gray-800">
              {isSuccessful ? 'Certificate is Authentic' : 'Verification Failed'}
            </h3>
            <p className="text-gray-600 mt-2">
              {isSuccessful
                ? 'All security checks have passed successfully.'
                : 'One or more security checks have failed.'}
            </p>
          </div>

          {/* Verification Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Verification Summary
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hash Integrity</span>
                <span
                  className={`text-sm font-medium ${
                    result.hashIntegrity ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {result.hashIntegrity ? '✅ Passed' : '❌ Failed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Digital Signature</span>
                <span
                  className={`text-sm font-medium ${
                    result.digitalSignature ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {result.digitalSignature ? '✅ Passed' : '❌ Failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Issuing Institution */}
          <div className="rounded-xl bg-white/20 backdrop-blur-md border border-gray-200/20 p-4 mb-6 shadow-inner">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={toggleInstitutionExpand}
      >
        <h4 className="text-sm font-semibold text-gray-800 tracking-wide">
          Actual Issuing Institution
        </h4>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${
            isInstitutionExpanded ? 'rotate-180' : ''
          }`}
        />
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isInstitutionExpanded ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-3 text-sm text-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium text-gray-600">Name:</span>
            <span className="text-right">{result.institutionName}</span>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300/30 to-transparent" />
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium text-gray-600">Address:</span>
            <span className="text-right break-all">{result.institutionAddress}</span>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300/30 to-transparent" />
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium text-gray-600">ID:</span>
            <span className="text-right">{result.institutionId}</span>
          </div>
        </div>
      </div>
    </div>


          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button variant="secondary" onClick={onViewCertificate} fullWidth>
              <FileTextIcon className="h-4 w-4 mr-2" />
              Mock Tampering
            </Button>
            <Button variant="primary" onClick={onClose} fullWidth>
              Close Verification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
