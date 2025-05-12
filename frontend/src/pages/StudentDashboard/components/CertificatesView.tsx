import React, { useEffect, useState } from 'react';
import CertificateCard from './CertificateCard';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import LoaderModal from './LoaderModal'
import CertificateModal from './CertificateModal';
import {VerifierModal} from './VerifierModal';
import { toast } from 'sonner';
import { CheckIcon } from 'lucide-react';
import { Toaster } from 'sonner';
export interface Certificate {
  _id: string;
  certificateId: string;
  studentId: string;
  institutionId: string;
  institutionName: string;
  ipfsHash: string;
  transactionHash: string;
  issuedTimeStamp: string;
  status: 'Issued' | 'Revoked';
  encryptedAesKey:string;
  details?: {
    studentId: string;
    name: string;
    degreeTitle:string;
    fatherName: string;
    branch: string;
    birthDate: string;
    sgpa?: number[];
    cgpa: number;
    award: string;
    issueTimestamp: string;
  };
}

const CertificatesView: React.FC = () => {
  const location = useLocation();
  const studentAddress = location.state?.address || "";
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifierModal, setShowVerifierModal] = useState(false);

  useEffect(() => {
    if (!studentAddress) return;

    const fetchCertificates = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/student-certificates",
          { address: studentAddress },
          { headers: { "Content-Type": "application/json" } }
        );
        setCertificates(response.data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        toast.error("Failed to load certificates");
      }
    };

    fetchCertificates();
  }, [studentAddress]);

  const handleCertificateClick = async (certificate: Certificate) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/get-certificate",
        { 
          certificateId: certificate.certificateId,
          studentId: certificate.studentId
        },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data)

      if (!response.data.success) throw new Error(response.data.message);
      
      // Set the selected certificate with the full decrypted data
      setSelectedCertificate({
        ...certificate, // Keep original certificate data
        details: response.data.certificate, // Add decrypted details
        encryptedAesKey: response.data.encryptedAesKey // Add encryption key if needed
      });
    } catch (error) {
      console.error("Error fetching certificate:", error);
      toast.error("Failed to load certificate details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    setSelectedCertificate(null);
    setShowVerifierModal(true);
  };

  const handleVerifierSelect =async (verifierId: string,publicKey: string) => {
    console.log('certifcate ID:',selectedCertificate?.certificateId);
    console.log(verifierId);
    try {
          await axios.post("http://localhost:5000/api/share-certificate", {
            certificateId: selectedCertificate?.certificateId,
            StudentId: selectedCertificate?.studentId,
            verifierId: verifierId,
            studentAddress,
            verifierPublicKey: publicKey,
            encryptedKey:selectedCertificate?.encryptedAesKey
          });
          toast.success(`Certificate shared with ${verifierId}`, {
            description: `Verification request sent to ${verifierId}`,
            icon: <CheckIcon className="text-emerald-400" size={18} />
          });
          setShowVerifierModal(false);  // Close the verifier modal
          setSelectedCertificate(null);
        } catch (error) {
          console.error("Error sharing certificate:", error);
          alert("Failed to share certificate.");
        }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent mb-2">
          Certificate Vault
        </h1>
        <p className="text-gray-300 font-outfit">
          Your blockchain-verified academic credentials
        </p>
      </div>
      <Toaster position="top-right" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map(certificate => (
          <CertificateCard 
            key={certificate._id} 
            certificate={certificate} 
            onClick={() => handleCertificateClick(certificate)} // Add onClick handler
          />
        ))}
      </div>

      {isLoading && <LoaderModal />}
      {selectedCertificate && (
        <CertificateModal 
          certificate={selectedCertificate} 
          onClose={() => setSelectedCertificate(null)}
          onShare={() => setShowVerifierModal(true)}
        />
      )}
      {showVerifierModal && (
        <VerifierModal 
          onClose={() => setShowVerifierModal(false)} 
          onSelect={handleVerifierSelect} 
        />
      )}
    </div>
  );
};

export default CertificatesView;