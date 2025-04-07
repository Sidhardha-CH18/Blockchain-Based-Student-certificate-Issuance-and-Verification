import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Modal, Box, Button, List, ListItem, ListItemText } from "@mui/material";
import "./Styles.css";

const StudentDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [verifiers, setVerifiers] = useState([]);
  const location = useLocation();
  const studentAddress = location.state?.address || "";

  useEffect(() => {
    if (!studentAddress) {
      console.error("Student address not found.");
      return;
    }
    axios
      .post("http://localhost:5000/api/student-certificates", { address: studentAddress }, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        console.log("Certificates received:", response.data);
        setCertificates(response.data);
      })
      .catch((error) => console.error("Error fetching certificates:", error));
  }, [studentAddress]);

  const handleViewCertificate = async (certificateId, studentId) => {
    if (!certificateId) return;
    try {
      const response = await axios.post(
        "http://localhost:5000/api/get-certificate",
        { certificateId, studentId },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Certificate Data Received:", response.data.encryptedAesKey);
      if (!response.data.success) throw new Error(response.data.message);
      setCertificateData({
        certificateId,
        ...JSON.parse(response.data.certificate),
        encryptedAesKeyForMetadata: response.data.encryptedAesKey
      });
      setOpenModal(true);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      alert("Failed to retrieve certificate.");
    }
  };

  const fetchVerifiers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/verifiers");
      setVerifiers(response.data.verifiers);
      console.log(response.data.verifiers)
    } catch (error) {
      console.error("Error fetching verifiers:", error);
    }
  };

  const handleShareCertificate = () => {
    setOpenModal(false);
    fetchVerifiers();
    setOpenShareModal(true);
  };

  const shareWithVerifier = async (verifier) => {
    try {
      console.log("certfiicateData share:",certificateData);
      await axios.post("http://localhost:5000/api/share-certificate", {
        certificateId: certificateData.certificateId,
        StudentId: certificateData.studentId,
        verifierId: verifier._id,
        studentAddress,
        verifierPublicKey: verifier.publicKey,
        encryptedKey:certificateData.encryptedAesKeyForMetadata
      });
      alert(`Certificate shared with ${verifier.name}`);
      setOpenShareModal(false);
    } catch (error) {
      console.error("Error sharing certificate:", error);
      alert("Failed to share certificate.");
    }
  };

  return (
    <div className="student-dashboard">
      <h2 className="dashboard-title">My Certificates</h2>
      <div className="certificate-list">
        {certificates.map((certificate) => (
          <Card key={certificate._id} className="certificate-card" onClick={() => handleViewCertificate(certificate.certificateId, certificate.studentId)}>
            <CardContent>
              <Typography variant="h6">Certificate ID: {certificate.certificateId}</Typography>
              <Typography variant="body2" color="textSecondary">
                Status: {certificate.status}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popup Modal for Viewing Certificate */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} className="modal-container">
        <Box className="modal-box">
          <Typography variant="h5">Certificate Details</Typography>
          {certificateData ? (
            <div>
              <Typography><strong>Student ID:</strong> {certificateData.studentId}</Typography>
              <Typography><strong>Name:</strong> {certificateData.name}</Typography>
              <Typography><strong>Degree:</strong> {certificateData.degreeTitle}</Typography>
              <Typography><strong>Father's Name:</strong> {certificateData.fatherName}</Typography>
              <Typography><strong>Branch:</strong> {certificateData.branch}</Typography>
              <Typography><strong>Birth Date:</strong> {certificateData.birthDate}</Typography>
              <Typography><strong>CGPA:</strong> {certificateData.cgpa}</Typography>
              <Typography><strong>Award:</strong> {certificateData.award}</Typography>
              
              {/* Button Container for spacing */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleShareCertificate}
                >
                  Share
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={() => setOpenModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <Typography>Loading certificate data...</Typography>
          )}
        </Box>
      </Modal>

      {/* Share Certificate Modal */}
      <Modal open={openShareModal} onClose={() => setOpenShareModal(false)} className="modal-container">
        <Box className="modal-box">
          <Typography variant="h5">Select Verifier</Typography>
          <List>
            {verifiers.map((verifier) => (
              <ListItem key={verifier._id}>
                <ListItemText primary={verifier.name} secondary={`ID: ${verifier._id}`} />
                <Button variant="contained" color="primary" onClick={() => shareWithVerifier(verifier)}>
                  Share
                </Button>
              </ListItem>
            ))}
          </List>
          <Button variant="contained" color="error" onClick={() => setOpenShareModal(false)}>
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
