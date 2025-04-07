import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Styles.css"; // Linking external styles

const IssueCertificate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract institution address from router state
  const institutionAddress = location.state?.address || "";
  
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    degreeTitle: "",
    fname: "",
    branch: "",
    bdate: { year: "", month: "", day: "" },
    sem1: "", sem2: "", sem3: "", sem4: "", sem5: "", sem6: "", sem7: "", sem8: "",
  });

  const [popupData, setPopupData] = useState(null); // Store certificate details
  const [showPopup, setShowPopup] = useState(false); // Control popup visibility

  if (!institutionAddress) {
    alert("Institution address not found. Please login again.");
    navigate("/");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("bdate.")) {
      const field = name.split(".")[1];
      setFormData({ ...formData, bdate: { ...formData.bdate, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, institutionAddress };
    
      console.log("Submitting Certificate Data:", payload);

      const response = await axios.post("http://localhost:5000/api/issue-certificate", payload);
      if (response.data.success) {
        setPopupData(response.data.certificateDetails);
        console.log(popupData)
        setShowPopup(true);
      //   navigate("/dashboard/institution", { state: { address: institutionAddress } });
      } else {
        alert("Failed to issue certificate.");
      }
    } catch (err) {
      console.error("Error issuing certificate:", err);
      alert("Error issuing certificate. Please try again.");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate("/dashboard/institution", { state: { address: institutionAddress } });
  };

  return (
    <div className="certificate-page">
      <div className="form-container">
        <h2 className="form-title">Issue Certificate</h2>

        <form onSubmit={handleSubmit} className="certificate-form">
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Student Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Degree Title</label>
            <input
              type="text"
              name="degreeTitle"
              value={formData.degreeTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Father's Name</label>
            <input
              type="text"
              name="fname"
              value={formData.fname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group dob-group">
            <label>Date of Birth</label>
            <div className="dob-inputs">
              <input
                type="number"
                name="bdate.year"
                value={formData.bdate.year}
                onChange={handleChange}
                placeholder="Year"
                required
              />
              <input
                type="number"
                name="bdate.month"
                value={formData.bdate.month}
                onChange={handleChange}
                placeholder="Month"
                required
              />
              <input
                type="number"
                name="bdate.day"
                value={formData.bdate.day}
                onChange={handleChange}
                placeholder="Day"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="block text-center text-lg font-semibold text-gray-700">Semester-wise SGPA</label>
            <div className="sgpa-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="sgpa-item">
                  <label>Sem {i + 1}</label>
                  <input
                    type="number"
                    name={`sem${i + 1}`}
                    value={formData[`sem${i + 1}`]}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="10"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">Issue Certificate</button>
        </form>
      </div>
      {/* Popup Component */}
      {showPopup && popupData && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Certificate Issued Successfully!</h2>
            <p><strong>Certificate ID:</strong> {popupData.certificateId}</p>
            <p><strong>Student ID:</strong> {popupData.studentId}</p>
            <p><strong>IPFS Hash:</strong> {popupData.ipfsHash}</p>
            <p><strong>Transaction Hash:</strong> {popupData.transactionHash}</p>
            <p><strong>Issued At:</strong> {new Date(popupData.issuedTimeStamp).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })}</p>

            <button onClick={closePopup}>Close & Go to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCertificate;
