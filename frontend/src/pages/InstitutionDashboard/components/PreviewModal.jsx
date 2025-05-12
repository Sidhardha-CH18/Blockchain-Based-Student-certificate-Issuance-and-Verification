import React from 'react';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import Button from './Button';
import InstituteLogo from '../assets/institute-logo.png';
import Signature from '../assets/signature.png';

const PreviewModal = ({ formData,
  institutionId,
  institutionName, onClose, onConfirm }) => {
    console.log(formData.sgpa)
  const validSgpa = formData.sgpa.filter(s => s !== '').map(s => parseFloat(s));
  const cgpa = validSgpa.length > 0 ? 
    (validSgpa.reduce((sum, curr) => sum + curr, 0) / validSgpa.length).toFixed(2) : 
    'N/A';

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Blur Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
  
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-pink-500/20 max-w-4xl w-full max-h-[90vh] z-10 flex flex-col"
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-20">
          <button onClick={onClose} className="text-pink-300/80 hover:text-pink-500 transition-colors">
            <XIcon size={24} />
          </button>
        </div>
  
        {/* Header */}
        <div className="pt-10 px-6">
          <h2 className="text-2xl font-light text-center mb-4 text-pink-300">Certificate Preview</h2>
        </div>
  
        {/* Scrollable Certificate Template */}
        <div className="px-6 overflow-y-auto max-h-[65vh] hide-scrollbar">
          <div className="bg-[#fcfcfc] border border-gray-200 rounded-lg p-8 mb-6 relative min-h-[600px]">
            {/* Background Logo */}
            <div className="absolute inset-0 z-0 opacity-5">
              <img 
                src={InstituteLogo} 
                alt="Institute Logo" 
                className="w-full h-full object-contain"
              />
            </div>
  
            {/* Certificate Content */}
            <div className="relative z-10">
              {/* Top Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
  
              {/* Institute Info */}
              <div className="absolute top-1 right-1 text-right z-20">
                <p className="text-lg text-gray-800 mt-1">{institutionName}</p>
                <p className="text-sm text-gray-600 mt-1">{institutionId}</p>
              </div>
  
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light tracking-wide text-gray-800 mb-2">
                  Certificate of Completion
                </h1>
                <p className="text-gray-500">This is to certify that</p>
              </div>
  
              {/* Student Info */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-medium text-gray-800 mb-1">
                  {formData.name || '[Student Name]'}
                </h2>
                <p className="text-gray-600">
                  {formData.fatherName ? `S/O ${formData.fatherName}` : "[Father's Name]"}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Student ID: {formData.studentId || '[Student ID]'}
                </p>
              </div>
  
              {/* Degree Info */}
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Has successfully completed the requirements for the degree of
                </p>
                <h3 className="text-xl font-medium text-gray-800 mt-2">
                  {formData.degreeTitle || '[Degree Title]'}
                </h3>
                <p className="text-gray-600 mt-1">
                  Specialization in {formData.branch || '[Branch]'}
                </p>
              </div>
  
              {/* Academic Performance */}
              <div className="mb-8">
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
                    Academic Performance
                  </h4>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {formData.sgpa.map((sgpa, index) => (
                      <div key={index} className="text-center">
                        <p className="text-xs text-gray-500">Semester {index + 1}</p>
                        <p className="text-sm text-gray-500 font-medium">{sgpa || '—'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Cumulative Grade Point Average (CGPA)
                    </p>
                    <p className="text-2xl font-medium text-gray-800 mt-1">{cgpa}</p>
                  </div>
                </div>
              </div>
  
              {/* Footer */}
              <div className="flex justify-around items-end mt-12">
                {/* Date Issued */}
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Date Issued</p>
                  <p className="text-sm text-gray-600">{currentDate}</p>
                </div>
  
                {/* Verified Badge */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="mb-3">
                    <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-pink-300 flex items-center justify-center">
                        <div className="text-xs text-pink-500 font-mono">VERIFIED</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Blockchain Verified</p>
                </div>
  
                {/* Signature */}
                <div className="flex-1 text-center">
                  <img src={Signature} alt="Signature" className="w-32 h-auto mb-1 mx-auto" />
                  <div className="w-32 h-0.5 bg-gray-400 mx-auto" />
                  <p className="text-xs text-gray-500 mt-1">Authorized Signature</p>
                </div>
              </div>
  
              {/* Certificate Footer Note */}
              <div className="text-center mt-8 text-xs text-gray-400">
                <p>Issued on the Ethereum blockchain • Verified and Immutable</p>
                <p className="mt-1">Certificate ID: CERT-XXXX-XXXX-XXXX</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Action Buttons */}
        <div className="p-6 border-t border-pink-500/10 flex justify-center gap-4 bg-gray-900/90 rounded-b-xl backdrop-blur-md">
          <Button onClick={onClose} className="border border-white-500/20 hover:bg-pink-500/10">
            Cancel
          </Button>
          <Button primary onClick={onConfirm}>
            Confirm & Issue
          </Button>
        </div>
      </motion.div>
    </div>
  );
  
};

export default PreviewModal;