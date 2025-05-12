import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BackgroundEffects = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Add gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, 'rgba(255, 78, 194, 0.15)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Enhanced particle system
    const particlesArray = [];
    const numberOfParticles = 100;

    class Particle {
      constructor() {
        this.reset();
        this.baseSize = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? 'rgba(236, 72, 153, 0.3)' : 'rgba(147, 51, 234, 0.3)';
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = this.baseSize + Math.sin(Date.now() * 0.001) * 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size = this.baseSize + Math.sin(Date.now() * 0.001) * 0.5;

        if (this.x > canvas.width + 50 || this.x < -50 || this.y > canvas.height + 50 || this.y < -50) {
          this.reset();
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, 'rgba(255, 78, 194, 0.1)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesArray.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Animated gradient blobs */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-1/4 left-1/4 w-[40vw] h-[40vh] bg-gradient-to-tr from-pink-500/20 to-purple-600/20 rounded-full blur-[100px]"
      />
      
      <motion.div 
        animate={{
          scale: [1, 0.8, 1],
          rotate: [360, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vh] bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-[80px]"
      />
    </div>
  );
};

export default BackgroundEffects;