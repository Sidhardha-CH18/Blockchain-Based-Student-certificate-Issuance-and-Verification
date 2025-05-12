import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';
import HeroSection from './components/HeroSection';

export default function LandingPage() {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4">
          <HeroSection />
        </main>
      </div>
    </div>
  );
}
