import React from 'react';
import { motion } from 'framer-motion';
import FormInput from './FormInput';
import Button from './Button';

const CertificateForm = ({ formData, onChange, onIssue }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('sgpa-')) {
      const index = parseInt(name.split('-')[1]);
      const newSgpa = [...formData.sgpa];
      newSgpa[index] = value;
      onChange({ ...formData, sgpa: newSgpa });
    } else if (name.startsWith('dob-')) {
      const part = name.split('-')[1];
      onChange({
        ...formData,
        dateOfBirth: { ...formData.dateOfBirth, [part]: value },
      });
    } else {
      onChange({ ...formData, [name]: value });
    }
  };

  const isFormValid = () => {
    return (
      formData.studentId &&
      formData.name &&
      formData.degreeTitle &&
      formData.fatherName &&
      formData.branch &&
      formData.dateOfBirth.year &&
      formData.dateOfBirth.month &&
      formData.dateOfBirth.day
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-xl overflow-hidden"
    >
      {/* ✨ Matching layered background like Dashboard */}
      <div className="absolute inset-0 bg-black z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-black-500/10 to-purple-500/10 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,78,194,0.15),transparent_50%)] z-0" />

      {/* 💡 Actual form container */}
      <div className="relative z-10 bg-pink-500/5 backdrop-blur-md border border-black-500/20 rounded-xl p-5 shadow-2xl">
        <h2 className="text-center text-2xl font-light tracking-wide text-white-500/50 mb-6">
          Issue New Certificate
        </h2>

        <div className="grid  grid-cols-1 md:grid-cols-3 gap-5">
          <FormInput
            label="Student ID"
            name="studentId"
            value={formData.studentId}
            onChange={handleInputChange}
            placeholder="Enter student ID"
          />
          <FormInput
            label="Student Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
          />
          <FormInput
            label="Degree Title"
            name="degreeTitle"
            value={formData.degreeTitle}
            onChange={handleInputChange}
            placeholder="e.g. Bachelor of Technology"
          />
          <FormInput
            label="Father's Name"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleInputChange}
            placeholder="Enter father's name"
          />
          <FormInput
            label="Branch"
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            placeholder="e.g. Computer Science"
          />

          {/* 🎂 Date of Birth */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-pink-300/60 mb-1">
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['year', 'month', 'day'].map((part, i) => (
                <input
                  key={part}
                  type="text"
                  name={`dob-${part}`}
                  value={formData.dateOfBirth[part]}
                  onChange={handleInputChange}
                  placeholder={['YYYY', 'MM', 'DD'][i]}
                  className="w-full bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all placeholder-pink-300/50 text-pink-300"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 📊 SGPA Section */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-pink-300/60 mb-3">
            Semester-wise SGPA
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {formData.sgpa.map((sgpa, index) => (
              <div key={index}>
                <label className="block text-xs text-pink-300/60 mb-2">
                  Semester {index + 1}
                </label>
                <input
                  type="text"
                  name={`sgpa-${index}`}
                  value={sgpa}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all placeholder-pink-300/50 text-sm text-pink-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Submit Button */}
        <div className="mt-10 flex justify-center">
          <Button
            primary
            onClick={onIssue}
            disabled={!isFormValid()}
            className="px-10 py-4 text-lg"
          >
            Issue Certificate
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateForm;
