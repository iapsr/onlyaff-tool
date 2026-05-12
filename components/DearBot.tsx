"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DearBot() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      typeMessage("Hi! My name is Dear. I help AdTech professionals.");
    }, 1000);

    return () => clearTimeout(timer);
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

  const handleInteraction = () => {
    typeMessage("I'm ready to optimize your campaigns! Let's go! 🚀");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Walking Avatar Container */}
      <div 
        className={`absolute bottom-0 animate-walk-around ${isHovered ? 'animation-pause' : ''}`}
        style={{ left: '0%' }}
      >
        <div 
          className={`relative flex flex-col items-center pointer-events-auto cursor-pointer ${isHovered ? '' : 'animate-bob'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleInteraction}
        >
          {/* Chat Bubble */}
          {message && (
            <div className="absolute -top-24 bg-white text-black p-5 rounded-3xl rounded-br-none shadow-2xl max-w-[280px] w-max animate-in zoom-in duration-300 z-10 border-4 border-[#BEFF00]">
              <p className="text-sm font-black leading-relaxed">{message}</p>
              <div className="absolute -bottom-4 right-8 w-6 h-6 bg-white border-b-4 border-r-4 border-[#BEFF00] transform rotate-45"></div>
            </div>
          )}

          {/* 3D Human Avatar Image */}
          <div className="relative w-[280px] h-[380px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-300">
             <Image 
               src="/avatar.png"
               alt="Dear the 3D Avatar"
               fill
               className="object-contain"
               priority
             />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes walk-around {
          0% { transform: translateX(-100%) scaleX(1); }
          45% { transform: translateX(85vw) scaleX(1); }
          50% { transform: translateX(85vw) scaleX(-1); }
          95% { transform: translateX(-20vw) scaleX(-1); }
          100% { transform: translateX(-100%) scaleX(1); }
        }
        .animate-walk-around {
          animation: walk-around 35s linear infinite;
        }
        .animation-pause {
          animation-play-state: paused !important;
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .animate-bob {
          animation: bob 0.6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
