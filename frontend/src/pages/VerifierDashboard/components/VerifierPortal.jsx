import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { Topbar } from './Topbar';
import { CertificateCard } from './CertificateCard';
import  CertificateModal  from './CertificateModal';
import { VerificationModal } from './VerificationModal';
import { ResultModal } from './ResultModal';
import axios from 'axios';
import { Particles } from './Particles';
import { motion } from 'framer-motion';
import { MockCertificateModal } from './MockCertificateModal';
import { TamperContentModal } from './TamperContentModal';
import { TamperSignatureModal } from './TamperSignatureModel';
import { Toaster } from 'sonner';
export default function VerifierPortal({address}) {
  const location = useLocation();
  const verifierAddress = address;
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [sharedCertificates, setSharedCertificates] = useState([]);
  const [certificateContent,setCertificateContent]=useState();
  const [showMockModal, setShowMockModal] = useState(false);
  const [showTamperSignatureModal, setShowTamperSignatureModal] = useState(false);
  const [showTamperContentModal, setShowTamperContentModal] = useState(false);
  const handleTamperTypeSelection = (type) => {
    if (type === 'signature') {
      setShowTamperSignatureModal(true);
    } else if (type === 'content') {
      setShowTamperContentModal(true);
    }
  }
  const [verificationResult, setVerificationResult] = useState({
    success: false,
    hashIntegrity: false,
    digitalSignature: false,
    institutionId:'',
    institutionName:'',
    institutionAddress:''
  });

  useEffect(() => {
    const fetchSharedCertificates = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/get-shared-certificates",
          { verifierAddress },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log(response.data.certificates);
        setSharedCertificates(response.data.certificates);
      } catch (error) {
        console.error("Error fetching shared certificates:", error);
      }
    };

    if (verifierAddress) {
      fetchSharedCertificates();
    }
  }, [verifierAddress]);

  const handleCardClick = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const handleVerify = async (certificateData) => {
    try {
      setShowCertificateModal(false);
      setShowVerificationModal(true);
      setCertificateContent(certificateData);
      // Start timing
      const startTime = Date.now();
      
      // Run verification and minimum delay concurrently
      const [verificationResponse] = await Promise.allSettled([
        axios.post("http://localhost:5000/api/verifyCertificate", {
          certificateData, 
          verifierAddress,
          certificateId: selectedCertificate.certificateId
        }),
        new Promise(resolve => setTimeout(resolve, 3000)) // Minimum 1 second delay
      ]);
  
      // Calculate remaining time to reach 1 second
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
      }
  
      if (verificationResponse.status === 'fulfilled') {
        const response = verificationResponse.value;
        setVerificationResult({
          success: response.data.status === "success",
          hashIntegrity: response.data.hashValid,
          digitalSignature: response.data.signatureValid,
          institutionId:response.data.institutionId,
          institutionName:response.data.institutionName,
          institutionAddress:response.data.institutionAddress
        });
      } else {
        throw verificationResponse.reason;
      }
  
    } catch (error) {
      console.error("Verification failed:", error.response?.data || error.message);
      setVerificationResult({
        success: false,
        hashIntegrity: false,
        digitalSignature: false
      });
    } finally {
      setShowVerificationModal(false);
      setShowResultModal(true);
    }
  };

  const closeAllModals = () => {
    setShowCertificateModal(false);
    setShowVerificationModal(false);
    setShowResultModal(false);
    setSelectedCertificate(null);
  };

  const viewCertificate = () => {
    setShowResultModal(false);
    setShowCertificateModal(true);
  };
  const mockMoadal = () => {
    setShowResultModal(false);
    setShowCertificateModal(false);
    setShowVerificationModal(false);
    setShowMockModal(true);
  };
  const closeMockModal = () => setShowMockModal(false);
  return (
    <div className="relative w-full min-h-screen font-sans bg-slate-50 overflow-hidden">
      <Toaster position="top-right" richColors />
      <Particles />
      <div className="relative z-10 flex flex-col w-full min-h-screen">
        <Topbar address={address} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h2 className="text-2xl font-medium text-gray-800 mb-6">
            Certificate Verification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedCertificates.map(cert => (
              <CertificateCard 
                key={cert.certificateId} 
                certificate={cert} 
                onClick={() => handleCardClick(cert)} 
              />
            ))}
          </div>
        </main>
      </div>
      {showCertificateModal && selectedCertificate && (
        <CertificateModal 
          certificate={selectedCertificate} 
          onClose={closeAllModals} 
          onVerify={handleVerify} 
        />
      )}
      {showVerificationModal && selectedCertificate && <VerificationModal />}
      {showResultModal && selectedCertificate && (
        <ResultModal 
          result={verificationResult} 
          onClose={closeAllModals} 
          onViewCertificate={mockMoadal} 
        />
      )}
      {showMockModal && (
        <MockCertificateModal onClose={closeMockModal} onSelectTamperType={handleTamperTypeSelection}  />
      )}
      {showTamperSignatureModal && (
        <TamperSignatureModal certificate={selectedCertificate}  onClose={() => setShowTamperSignatureModal(false)} />
      )}

      {showTamperContentModal && selectedCertificate && (
        <TamperContentModal 
          certificateData={certificateContent}
          certificate={selectedCertificate} 
          onClose={() => setShowTamperContentModal(false)} 
        />
      )}

    </div>
  );
};