import React,{useRef, useState} from 'react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import Button from './Button';
import InstituteLogo from '../assets/institute-logo.png';
import jsPDF from 'jspdf';
import Signature from '../assets/signature.png';
import { DownloadIcon, ShareIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
const CertificateModal = ({ certificate, onClose, onShare }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);

  console.log(certificate)
  const certificateDetails=JSON.parse(certificate.details)
  console.log(certificateDetails.sgpa)
  const sgpa=certificateDetails.sgpa;
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
  
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      // Calculate the vertical position to center the image
      const pageHeight = pdf.internal.pageSize.height; // Get the height of the PDF page
      const verticalOffset = (pageHeight - imgHeight) / 2; // Calculate the offset to center the image
  
      pdf.addImage(imgData, 'PNG', 0, verticalOffset, imgWidth, imgHeight);
      pdf.save(`${certificate.certificateId}-certificate.pdf`);
  
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  /*
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        useCORS: true, // For cross-origin images
        scale: 2 // Higher resolution
      });

      const link = document.createElement('a');
      link.download = `${certificate.certificateId}-certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Certificate downloaded successfully', {
        duration: 3000,
        className: 'bg-black/80 backdrop-blur-sm border border-emerald-500/30 text-white',
        icon: '✓'
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };
  */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred dark overlay */}

      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
  
      {/* Modal container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-pink-500/20 max-w-4xl w-full max-h-[90vh] z-10 flex flex-col"
      >
        {/* Close button */}
        <div className="absolute top-4 right-4 z-20">
          <button onClick={onClose} className="text-pink-300/80 hover:text-pink-500 transition-colors">
            <XIcon size={24} />
          </button>
        </div>
  
        {/* Header */}
        <div className="pt-10 px-6">
          <h2 className="text-2xl font-light text-center mb-4 text-pink-300">
            Your Certificate
          </h2>
        </div>
  
        {/* Scrollable certificate view */}
        <div className="px-6 overflow-y-auto max-h-[65vh] hide-scrollbar">
          <div ref={certificateRef} className="bg-[#fcfcfc] border border-gray-200 rounded-lg p-8 mb-6 relative min-h-[600px]">
            {/* Background Logo */}
            <div className="absolute inset-0 z-0 opacity-5">
              <img src={InstituteLogo} alt="Institute Logo" className="w-full h-full object-contain" />
            </div>
  
            {/* Certificate Content */}
            <div className="relative z-10">
              {/* Top Badge */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
  
              {/* Institute Info */}
              <div className="absolute top-1 right-1 text-right z-20">
                <p className="text-lg text-gray-800 mt-1">{certificate.institutionName}</p>
                <p className="text-sm text-gray-600 mt-1">{certificate.institutionId}</p>
              </div>
  
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light tracking-wide text-gray-800 mb-2">Certificate of Completion</h1>
                <p className="text-gray-500">This is to certify that</p>
              </div>
  
              {/* Student Info */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-medium text-gray-800 mb-1">{certificateDetails.name}</h2>
                <p className="text-gray-600">S/O {certificateDetails.fatherName}</p>
                <p className="text-gray-600 text-sm mt-2">Student ID: {certificateDetails.studentId}</p>
              </div>
  
              {/* Degree Info */}
              <div className="text-center mb-8">
                <p className="text-gray-600">Has successfully completed the requirements for the degree of</p>
                <h3 className="text-xl font-medium text-gray-800 mt-2">{certificateDetails.degreeTitle}</h3>
                <p className="text-gray-600 mt-1">Specialization in {certificateDetails.branch}</p>
              </div>
  
              {/* Academic Performance */}
              <div className="mb-8">
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Academic Performance</h4>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {sgpa.map((gpa, index) => (
                      <div key={index} className="text-center">
                        <p className="text-xs text-gray-500">Semester {index + 1}</p>
                        <p className="text-sm font-medium text-gray-600">{gpa}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cumulative Grade Point Average (CGPA)</p>
                    <p className="text-2xl font-medium text-gray-800 mt-1">{certificateDetails.cgpa}</p>
                  </div>
                </div>
              </div>
  
              {/* Footer Section */}
              <div className="flex justify-around items-end mt-12">
                {/* Date */}
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Date Issued</p>
                  <p className="text-sm text-gray-600">
                    {new Date(certificate.issuedTimeStamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
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
                  <div className="w-32 h-0.5 bg-gray-400 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-1">Authorized Signature</p>
                </div>
              </div>
  
              {/* Certificate ID */}
              <div className="text-center mt-8 text-xs text-gray-400">
                <p>Issued on the Ethereum blockchain • Verified and Immutable</p>
                <p className="mt-1">Certificate ID: {certificate.certificateId}</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Action buttons */}
        <div className="p-6 border-t border-pink-500/10 flex justify-center gap-4 bg-gray-900/90 rounded-b-xl backdrop-blur-md">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 relative overflow-hidden"
          >
            {isDownloading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <DownloadIcon className="w-5 h-5" />
                Download Certificate
              </>
            )}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
  
          <Button
            onClick={onShare}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            Share Certificate
          </Button>
        </div>
      </motion.div>
    </div>
  );
  
};

export default CertificateModal;
