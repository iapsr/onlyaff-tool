"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function DearBot() {
  const botRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Animate in after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      typeMessage("Hi, My name is Dear. I help AdTech professionals.");
    }, 1000);

    const handleMouseMove = (e: MouseEvent) => {
      if (botRef.current) {
        const rect = botRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate rotation based on mouse position relative to bot
        const dx = (e.clientX - centerX) / window.innerWidth;
        const dy = (e.clientY - centerY) / window.innerHeight;
        
        setMousePos({ x: dx * 40, y: dy * 40 }); // Max 40 deg rotation
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const typeMessage = (text: string) => {
    let i = 0;
    setMessage('');
    const interval = setInterval(() => {
      if (i < text.length) {
        setMessage((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleClick = () => {
    typeMessage("I'm ready to optimize your campaigns! 🚀");
    
    // Add a little spin
    if (botRef.current) {
      botRef.current.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      botRef.current.style.transform = `rotateY(360deg) scale(1.1)`;
      setTimeout(() => {
        if (botRef.current) {
          botRef.current.style.transition = 'transform 0.2s ease-out';
          botRef.current.style.transform = `rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg) scale(1)`;
        }
      }, 500);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex items-end gap-4 pointer-events-none">
      
      {/* Chat Bubble */}
      {message && (
        <div className="relative bg-[#111] border border-[#BEFF00]/30 text-white p-4 rounded-2xl rounded-br-sm shadow-[0_0_30px_-5px_rgba(190,255,0,0.2)] max-w-[220px] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
          <p className="text-xs font-bold leading-relaxed tracking-wide text-gray-200">{message}</p>
          <div className="absolute -bottom-2 right-4 w-4 h-4 bg-[#111] border-b border-r border-[#BEFF00]/30 transform rotate-45"></div>
        </div>
      )}

      {/* 3D Bot Avatar */}
      <div 
        ref={botRef}
        onClick={handleClick}
        className="relative w-20 h-20 cursor-pointer pointer-events-auto animate-float group"
        style={{
          perspective: '1000px',
          transform: `rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Glowing Aura */}
        <div className="absolute inset-0 bg-[#BEFF00]/20 rounded-full blur-xl animate-pulse group-hover:bg-[#BEFF00]/40 transition-colors duration-500"></div>
        
        {/* Main Body (Glass 3D Sphere) */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/80 backdrop-blur-xl border border-white/20 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.2),_0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transform-style-3d group-hover:border-[#BEFF00]/50 transition-colors duration-300">
           
           {/* Inner Core */}
           <div className="w-12 h-12 bg-[#050505] rounded-full shadow-[inset_0_5px_10px_rgba(255,255,255,0.1)] flex items-center justify-center relative transform translate-z-10">
              {/* Eye (Reacts to hover) */}
              <div className="w-4 h-4 bg-[#BEFF00] rounded-full shadow-[0_0_20px_8px_rgba(190,255,0,0.6)] animate-blink group-hover:scale-125 transition-transform duration-300"></div>
              
              {/* Cyber details */}
              <div className="absolute top-1/2 left-2 w-2 h-[1px] bg-[#BEFF00]/30"></div>
              <div className="absolute top-1/2 right-2 w-2 h-[1px] bg-[#BEFF00]/30"></div>
           </div>

           {/* 3D Rings */}
           <div className="absolute inset-0 border-[2px] border-t-[#BEFF00]/50 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
           <div className="absolute inset-1 border-[2px] border-b-white/20 border-r-transparent border-t-transparent border-l-transparent rounded-full animate-spin-reverse-slow"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 96%, 98% { transform: scaleY(1); }
          97% { transform: scaleY(0.1); }
        }
        .animate-blink {
          animation: blink 4s infinite;
        }
        @keyframes spin-slow {
          from { transform: rotateZ(0deg) rotateX(30deg); }
          to { transform: rotateZ(360deg) rotateX(30deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes spin-reverse-slow {
          from { transform: rotateZ(360deg) rotateY(30deg); }
          to { transform: rotateZ(0deg) rotateY(30deg); }
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 8s linear infinite;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .translate-z-10 {
          transform: translateZ(10px);
        }
      `}} />
    </div>
  );
}
