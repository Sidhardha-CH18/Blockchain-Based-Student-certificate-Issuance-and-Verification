import React, {useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import CertificateForm from './components/CertificateForm';
import BackgroundEffects from './components/BackgroundEffects';
import PreviewModal from './components/PreviewModal';
import LoadingOverlay from './components/LoadingOverlay';
import SuccessCheckmark from './components/SuccessCheckmark';
import { CheckCircleIcon, CopyIcon, ExternalLinkIcon,HomeIcon } from 'lucide-react';
import axios from 'axios'
import { Toaster } from 'sonner';
export default function IssueCertificate({ institutionAddress, onBack }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showSuccessDetails, setShowSuccessDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  
    const [institutionName, setName] = useState(null);
    const [institutionId, setId] = useState(null);
    useEffect(() => {
      if (!institutionAddress) {
        console.error("Institution address not found.");
        return;
      }
  
      axios
        .post("http://localhost:5000/api/institute-dashboard", { 
          address: institutionAddress
        }, { 
          headers: { "Content-Type": "application/json" } 
        })
        .then((response) => {
          setId(response.data.id);
          setName(response.data.name);
        })
        .catch((error) => {
          console.error("Error fetching certificates:", error);
        });
    }, [institutionAddress]);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    degreeTitle: '',
    fatherName: '',
    branch: '',
    dateOfBirth: { year: '', month: '', day: '' },
    sgpa: Array(8).fill('')
  });

  const [transactionDetails, setTransactionDetails] = useState({
    certificateId: '',
    ipfsHash: '',
    transactionHash: ''
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleFormChange = newData => {
    setFormData(newData);
  };

  const handleIssue = () => {
    console.log(formData)
    setShowPreview(true);
  };

  const handleConfirmIssue = async () => {
    setShowPreview(false);
    setIsLoading(true);
    console.log(institutionAddress)
    console.log(formData)
    if (!institutionAddress) {
      toast.error("Institution address not found");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/issue-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          institutionAddress,
          dob: `${formData.dateOfBirth.year}-${formData.dateOfBirth.month}-${formData.dateOfBirth.day}`,
          sem1: formData.sgpa[0],
          sem2: formData.sgpa[1],
          sem3: formData.sgpa[2],
          sem4: formData.sgpa[3],
          sem5: formData.sgpa[4],
          sem6: formData.sgpa[5],
          sem7: formData.sgpa[6],
          sem8: formData.sgpa[7],
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to read response stream");

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const match = event.match(/data: ({.*})/);
          if (!match) continue;

          const payload = JSON.parse(match[1]);
          switch (payload.type) {
            case 'progress':
              setLoadingStatus(payload.message);
              break;
            
            case 'error':
              toast.error(payload.message);
              setIsLoading(false);
              break;
            
            case 'complete':
              console.log(payload.data.certificateDetails.transactionHash)
              setTransactionDetails({
                certificateId: payload.data.certificateDetails.certificateId,
                ipfsHash: payload.data.certificateDetails.ipfsHash,
                transactionHash: payload.data.certificateDetails.transactionHash
              });
              setIsLoading(false);
              setShowCheckmark(true);
              toast.success("Certificate issued successfully!");
              break;
          }
        }
      }
    } catch (err) {
      toast.error(err.message || "Error issuing certificate");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleCheckmarkComplete = () => {
    console.log('checkmark')
    setTimeout(() => {
      setShowCheckmark(false);
      setShowSuccessDetails(true);
    }, 800);
  };

  const handleCloseSuccess = () => {
    console.log('success')
    setShowSuccessDetails(false);
    onBack();
  };

  return (
    <div className="relative w-full bg-black overflow-hidden">
      <BackgroundEffects />
      <Toaster position="top-right" />
      <div className="relative z-10 w-full flex flex-col pt-10">
        <main className="flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-5xl" // shrunk from 4xl to 3xl
          >
            <CertificateForm 
              formData={formData} 
              onChange={handleFormChange} 
              onIssue={handleIssue} 
            />
          </motion.div>
        </main>
      </div>


      {showPreview && <PreviewModal 
        formData={formData} 
        institutionId={institutionId}
        institutionName={institutionName}
        onClose={() => setShowPreview(false)} 
        onConfirm={handleConfirmIssue} 
      />}

      {isLoading && <LoadingOverlay status={loadingStatus} />}

      {showCheckmark && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify center bg-black/60 backdrop-blur-sm"
        >
          <SuccessCheckmark onComplete={() => handleCheckmarkComplete()} />
        </motion.div>
      )}

      {showSuccessDetails && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-black-500/5 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-pink-500/20 max-w-md w-full"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-light text-center mb-4 text-pink-300">
                Certificate Issued Successfully
              </h2>
              <div className="space-y-4 mb-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-pink-300/60">Certificate ID</span>
                      <button 
                        onClick={() => copyToClipboard(transactionDetails.certificateId)}
                        className="text-pink-300 hover:text-pink-400 transition-colors"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-mono text-sm bg-pink-500/10 p-2 rounded text-pink-300">
                      {transactionDetails.certificateId}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                    <span className="text-sm text-pink-300/60">IPFS Hash</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => copyToClipboard(transactionDetails.ipfsHash)}
                          className="text-pink-300 hover:text-pink-400 transition-colors"
                        >
                          <CopyIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${transactionDetails.ipfsHash}`, '_blank')}
                          className="text-pink-300 hover:text-pink-400 transition-colors"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-mono text-sm bg-pink-500/10 p-2 rounded truncate text-pink-300">
                      {transactionDetails.ipfsHash}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-pink-300/60">Transaction Hash</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => copyToClipboard(transactionDetails.transactionHash)}
                          className="text-pink-300 hover:text-pink-400 transition-colors"
                        >
                          <CopyIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transactionDetails.transactionHash}`)}
                          className="text-pink-300 hover:text-pink-400 transition-colors"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-mono text-sm bg-pink-500/10 p-2 rounded truncate text-pink-300">
                      {transactionDetails.transactionHash}
                    </p>
                  </div>
                </motion.div>
              </div>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleCloseSuccess}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-pink-500/20 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}

              >
                <HomeIcon size={18} />
                <span>Go to Dashboard</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}