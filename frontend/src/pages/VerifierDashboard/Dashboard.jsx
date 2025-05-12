import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import VerifierPortal from './components/VerifierPortal';
export default function VerifierDashboard() {
  
  const location = useLocation();
  const verifierAddress = location.state?.address || "";
  return <div className="w-full min-h-screen bg-slate-50">
      <VerifierPortal address={verifierAddress} />
    </div>;
}