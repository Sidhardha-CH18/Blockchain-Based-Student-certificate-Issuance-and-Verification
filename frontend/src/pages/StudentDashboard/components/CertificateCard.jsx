import React from 'react';
import { CalendarIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

const CertificateCard = ({ certificate,onClick }) => {
  const getStatusIcon = () => {
    switch (certificate.status) {
      case 'Issued':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />;
      case 'Revoked':
        return <AlertCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    switch (certificate.status) {
      case 'Issued':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'Revoked':
        return 'bg-red-500/20 text-red-300';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return ( 
    <div 
      className="relative group cursor-pointer" onClick={onClick}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-300/30 to-cyan-300/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all duration-300 h-full overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-200/10 to-cyan-300/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <h3 className="text-xl font-orbitron font-semibold text-white mb-2 relative z-10">
          {certificate.certificateId}
        </h3>
        
        <div className="text-gray-400 text-sm mb-4 relative z-10">
          <p className="truncate">Issued by: {certificate.institutionName}</p>
          <p className="text-xs mt-1">Student ID: {certificate.studentId}</p>
        </div>

        <div className="flex items-center text-sm text-gray-300 mb-3 relative z-10">
          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
          <span>Issued: {formatDate(certificate.issuedTimeStamp)}</span>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <span className="text-sm text-gray-300">
            TX: {certificate.transactionHash.slice(0, 6)}...{certificate.transactionHash.slice(-4)}
          </span>
          <span className={`flex items-center text-xs px-3 py-1 rounded-full ${getStatusClass()}`}>
            {getStatusIcon()}
            <span className="ml-1">{certificate.status}</span>
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default CertificateCard;