import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Modal,
  Box,
  Button
} from "@mui/material";
import "./Styles.css";

const VerifierDashboard = () => {
  const location = useLocation();
  const verifierAddress = location.state?.address || "";
  const [sharedCertificates, setSharedCertificates] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState(null);

  useEffect(() => {
    const fetchSharedCertificates = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/get-shared-certificates",
          { verifierAddress },
          { headers: { "Content-Type": "application/json" } }
        );
        console.log(response.data.certificates)
        setSharedCertificates(response.data.certificates);
      } catch (error) {
        console.error("Error fetching shared certificates:", error);
      }
    };

    if (verifierAddress) {
      fetchSharedCertificates();
    }
  }, [verifierAddress]);

  const handleOpenCertificate = async (cert) => {
    try {
        const response = await axios.post(
        "http://localhost:5000/api/view-shared-certificate",
        {
          certificateId: cert.certificateId,
          studentId: cert.studentId,
          verifierId: cert.verifierId,
          verifierAddress
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        console.log(response.data.certificateData);
        setSelectedCertificateId(cert.certificateId)
        setCertificateData(
          JSON.parse(response.data.certificateData)
        );        
        setVerifyResult(null);
        setOpenModal(true);
      } else {
        alert("Failed to retrieve certificate: " + response.data.message);
      }
    } catch (error) {
      console.error("Error opening certificate:", error);
      alert("Something went wrong while fetching the certificate.");
    }
  };

  const handleCloseModal = () => {
    console.log(certificateData)
    setOpenModal(false);
    setSelectedCertificateId(null)
    setCertificateData(null);
    setVerifyResult(null);
  };

  const handleVerify = async () => {
    try {
        console.log("verify")
        console.log(certificateData);
        axios.post("http://localhost:5000/api/verifyCertificate", {
          certificateData, verifierAddress,certificateId:selectedCertificateId
        })
        .then((res) => {
          console.log(res.data);
          setVerifyResult({
            hashValid: res.data.hashValid,
            signatureValid: res.data.signatureValid
          });
        })
        .catch((err) => {
          console.error("Verification failed:", err.response?.data || err.message);
        });
        
    } catch (error) {
      console.error("Verification failed:", error);
      setVerifyResult({ hashValid: false, signatureValid: false });
    }
  };

  return (
    <div className="verifier-dashboard">
      <h2 className="dashboard-title">Shared Certificates</h2>
      <div className="certificate-list">
        {sharedCertificates.map((cert, index) => (
          <Card
            key={index}
            className="certificate-card"
            onClick={() => handleOpenCertificate(cert)}
          >
            <CardContent>
              <Typography variant="h6">Certificate ID: {cert.certificateId}</Typography>
              <Typography variant="body2">Student ID: {cert.studentId}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Certificate Detail Modal */}
      <Modal open={openModal} onClose={handleCloseModal} className="modal-container">
        <Box className="modal-box">
          {certificateData ? (
            <>
              <Typography variant="h5" gutterBottom>Certificate Details</Typography>
              <Typography><strong>Name:</strong> {certificateData.name}</Typography>
              <Typography><strong>Degree:</strong> {certificateData.degreeTitle}</Typography>
              <Typography><strong>Father's Name:</strong> {certificateData.fatherName}</Typography>
              <Typography><strong>Branch:</strong> {certificateData.branch}</Typography>
              <Typography><strong>Birth Date:</strong> {certificateData.birthDate}</Typography>
              <Typography><strong>CGPA:</strong> {certificateData.cgpa}</Typography>
              <Typography><strong>Award:</strong> {certificateData.award}</Typography>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <Button variant="contained" color="primary" onClick={handleVerify}>
                  Verify
                </Button>
                <Button variant="contained" color="error" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>

              {verifyResult && (
                <div style={{ marginTop: "20px" }}>
                  <Typography>
                    <strong>Hash Integrity:</strong>{" "}
                    {verifyResult.hashValid ? "✅ Valid" : "❌ Invalid"}
                  </Typography>
                  <Typography>
                    <strong>Digital Signature:</strong>{" "}
                    {verifyResult.signatureValid ? "✅ Valid" : "❌ Invalid"}
                  </Typography>
                  <Typography variant="h6" style={{ marginTop: "10px", color: verifyResult.hashValid && verifyResult.signatureValid ? "green" : "red" }}>
                    {verifyResult.hashValid && verifyResult.signatureValid ? "✔ Certificate is Authentic" : "✖ Certificate Verification Failed"}
                  </Typography>
                </div>
              )}
            </>
          ) : (
            <Typography>Loading certificate details...</Typography>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default VerifierDashboard;
