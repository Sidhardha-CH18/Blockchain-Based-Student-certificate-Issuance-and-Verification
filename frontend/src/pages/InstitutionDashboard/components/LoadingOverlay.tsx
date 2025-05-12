import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LockIcon, PenIcon, CloudIcon, LinkIcon } from 'lucide-react';

const LoadingOverlay = ({ status }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      id: 'encryption',
      icon: <LockIcon size={24} className="text-pink-500" />,
      title: 'AES Encryption',
      description: 'Encrypting certificate data'
    },
    {
      id: 'signature',
      icon: <PenIcon size={24} className="text-pink-500" />,
      title: 'ECC Digital Signature',
      description: 'Signing with elliptic curve cryptography'
    },
    {
      id: 'ipfs',
      icon: <CloudIcon size={24} className="text-pink-500" />,
      title: 'IPFS Upload',
      description: 'Storing on decentralized network'
    },
    {
      id: 'blockchain',
      icon: <LinkIcon size={24} className="text-pink-500" />,
      title: 'Blockchain Transaction',
      description: 'Recording on immutable ledger'
    }
  ];

  // Sync currentStep with backend progress
  useEffect(() => {
    const stepIndex = steps.findIndex(step => 
      status?.toLowerCase().includes(step.title.toLowerCase())
    );
    if (stepIndex > -1) {
      setCurrentStep(stepIndex);
    }
  }, [status]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg"
    >
      {/* <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" /> */}
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-pink-500/5 backdrop-blur-md rounded-xl p-10 shadow-2xl border border-pink-500/20 max-w-md w-full text-center"
      >
        {/* Loading spinner remains the same */}
        <div className="text-center mb-6">
          <div className="mb-8">
            <div className="relative w-24 h-24 mx-auto">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3, 
                  ease: 'linear' 
                }}
                className="absolute inset-0 rounded-full border-2 border-pink-500 border-t-transparent"
              />
              <motion.div 
                animate={{ rotate: -180 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  ease: 'linear' 
                }}
                className="absolute inset-2 rounded-full border-2 border-purple-500 border-b-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-30 blur-md" />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-pink-300">
            {status || 'Processing Certificate'}
          </h2>
          <p className="text-pink-300/60 mt-1">
            Securing your document on the blockchain
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center p-3 rounded-lg ${
                index === currentStep 
                  ? 'bg-pink-500/10 border border-pink-500/20' 
                  : index < currentStep 
                    ? 'bg-pink-500/5' 
                    : ''
              }`}
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                index === currentStep 
                  ? 'bg-pink-500/20 text-pink-300 animate-pulse' 
                  : index < currentStep 
                    ? 'bg-pink-500/10 text-pink-300' 
                    : 'bg-pink-500/5 text-pink-300/50'
              }`}>
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <h3 className={`font-medium ${
                  index <= currentStep ? 'text-pink-300' : 'text-pink-300/50'
                }`}>
                  {step.title}
                </h3>
                
              </div>

              {index === currentStep && (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full"
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingOverlay;