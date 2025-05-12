import React, { useEffect, useState } from 'react';
import { XIcon, CheckIcon } from 'lucide-react';
import { Button } from './common/Button';
import axios from 'axios';
import InstituteLogo from '../assets/institute-logo.png';
import jsPDF from 'jspdf';
import Signature from '../assets/signature.png';

export default function CertificateModal({
  certificate,
  onClose,
  onVerify
  
}) {
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);
  const [institutionId,setInstitutionId]=useState(null);
  const [institutionName,setInstitutionName]=useState(null);
  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificate) return;
      
      try {
        setIsDecrypting(true);
        const response = await axios.post(
          "http://localhost:5000/api/view-shared-certificate",
          {
            certificateId: certificate.certificateId,
            studentId: certificate.studentId,
            verifierId: certificate.verifierId
          },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.success) {
          console.log(response.data)
          setCertificateData(
             JSON.parse(response.data.certificateData
            ));
          setInstitutionName(response.data.institutionName);
          setInstitutionId(response.data.institutionId);
          setError(null);
        } else {
          setError(response.data.message || "Failed to retrieve certificate");
        }
      } catch (error) {
        console.error("Error fetching certificate:", error);
        setError("Something went wrong while fetching the certificate.");
      } finally {
        setIsDecrypting(false);
      }
    };

    fetchCertificate();
  }, [certificate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white/90 backdrop-blur-md rounded-lg shadow-lg w-full max-w-2xl mx-4 overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
        {isDecrypting ? (
          <div className="p-8 flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-800">
              Decrypting Certificate...
            </p>
            <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 flex flex-col items-center justify-center h-96">
            <div className="text-red-500 mb-4">⚠️</div>
            <p className="text-lg font-medium text-gray-800">{error}</p>
            <Button variant="secondary" onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-gray-800">
                  Certificate Details
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-[#fcfcfc] border border-gray-200 rounded-lg p-8 relative min-h-[600px]">
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
                  <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-1 right-1 text-right z-20">
                    <p className="text-lg text-gray-800 mt-1">{institutionName}</p>
                    <p className="text-sm text-gray-600 mt-1">{institutionId}</p>
                  </div>

                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-light tracking-wide text-gray-800 mb-2">
                      Certificate of Completion
                    </h1>
                    <p className="text-gray-500">This is to certify that</p>
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-medium text-gray-800 mb-1">
                      {certificateData.name}
                    </h2>
                    <p className="text-gray-600">
                      S/O {certificateData.fatherName}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Student ID: {certificateData.studentId}
                    </p>
                  </div>

                  <div className="text-center mb-8">
                    <p className="text-gray-600">
                      Has successfully completed the requirements for the degree of
                    </p>
                    <h3 className="text-xl font-medium text-gray-800 mt-2">
                      {certificateData.degreeTitle}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Specialization in {certificateData.branch}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
                        Academic Performance
                      </h4>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {certificateData.sgpa.map((gpa, index) => (
                          <div key={index} className="text-center">
                            <p className="text-xs text-gray-500">
                              Semester {index + 1}
                            </p>
                            <p className="text-sm text-gray-500 font-medium">{gpa}</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          Cumulative Grade Point Average (CGPA)
                        </p>
                        <p className="text-2xl font-medium text-gray-800 mt-1">
                          {certificateData.cgpa}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex justify-around items-end mt-12">
                    <div className="flex-1 text-center">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Date Issued
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(certificate.issuedTimeStamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                      <div className="mb-3">
                        <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-pink-300 flex items-center justify-center">
                            <div className="text-xs text-pink-500 font-mono">
                              VERIFIED
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Blockchain Verified</p>
                    </div>

                    <div className="flex-1 text-center">
                      <img 
                        src={Signature} 
                        alt="Signature" 
                        className="w-32 h-auto mb-1 mx-auto"
                      />
                      <div className="w-32 h-0.5 bg-gray-400 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-1">Authorized Signature</p>
                    </div>
                  </div>

                  <div className="text-center mt-8 text-xs text-gray-400">
                    <p>Issued on the Ethereum blockchain • Verified and Immutable</p>
                    <p className="mt-1">Certificate ID: {certificate.certificateId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <Button variant="secondary" onClick={onClose}>
                Close Window
              </Button>
              <Button variant="primary" onClick={() => onVerify(certificateData)}>
                <CheckIcon className="h-4 w-4 mr-2" />
                Verify Certificate
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};