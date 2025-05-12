import React from 'react';
import { FileTextIcon } from 'lucide-react';
export const CertificateCard = ({
  certificate,
  onClick
}) => {
  return <div onClick={onClick} className="relative p-6 rounded-lg bg-white/60 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-200 cursor-pointer group overflow-hidden animate-float">
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${certificate.status === 'verified' ? 'bg-primary-light text-primary-dark' : 'bg-accent-light text-accent-dark'}`}>
        {certificate.status === 'verified' ? '✅ Verified' : '🟡 Pending'}
      </div>
      <div className="mt-4">
        <h3 className="font-medium text-gray-800">Certificate ID</h3>
        <p className="text-sm text-gray-600">{certificate.certificateId}</p>
      </div>
      <div className="mt-4">
        <h3 className="font-medium text-gray-800">Student ID</h3>
        <p className="text-sm text-gray-600">{certificate.studentId}</p>
      </div>
      <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center text-sm text-accent-dark font-medium">
          <FileTextIcon className="h-4 w-4 mr-1" />
          <span>Tap to Inspect</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>;
};