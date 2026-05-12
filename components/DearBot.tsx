"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DearBot() {
  const [isVisible, setIsVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Walk into the screen delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      typeMessage("Hi! My name is Dear. I help AdTech professionals.");
    }, 500);

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
    }, 40);
  };

  const handleInteraction = () => {
    setIsListening(true);
    setMessage('');
    setTimeout(() => {
      setIsListening(false);
      typeMessage("I am analyzing your request. Let's optimize those campaigns! 🚀");
    }, 2000);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-1000 ease-out transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
      
      {/* Chat Bubble overlay */}
      {message && !isListening && (
        <div className="absolute -top-20 right-0 bg-white/90 backdrop-blur-md text-black p-4 rounded-2xl rounded-br-sm shadow-2xl w-[260px] animate-in zoom-in duration-300 z-10 border border-white/20">
          <p className="text-sm font-bold leading-snug">{message}</p>
        </div>
      )}

      {/* HeyGen-style Interactive Video Container */}
      <div 
        className="relative w-[280px] h-[400px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),_0_0_40px_rgba(190,255,0,0.1)] group cursor-pointer"
        onClick={handleInteraction}
      >
        {/* Live Indicator */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          <span className="text-[9px] font-black tracking-widest text-white/90 uppercase">Live Stream</span>
        </div>

        {/* Dynamic Avatar (Simulating Video Motion) */}
        <div className="absolute inset-0 flex items-center justify-center animate-breathe-and-walk mix-blend-lighten">
           <Image 
             src="/avatar.png"
             alt="Dear HeyGen Avatar"
             fill
             className="object-cover object-top filter contrast-125 brightness-110 drop-shadow-[0_0_20px_rgba(190,255,0,0.2)]"
             priority
           />
        </div>

        {/* UI Overlay Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
           <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3.5 flex items-center justify-between border border-white/10 shadow-lg transform group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex flex-col">
                 <span className="text-sm font-black text-white flex items-center gap-2">
                   Dear 
                   <span className="w-1.5 h-1.5 rounded-full bg-[#BEFF00]"></span>
                 </span>
                 <span className={`text-[10px] font-bold ${isListening ? 'text-[#BEFF00] animate-pulse' : 'text-gray-400'}`}>
                   {isListening ? 'Listening to microphone...' : 'Interactive AI Assistant'}
                 </span>
              </div>
              <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-[#BEFF00] text-black shadow-[0_0_20px_rgba(190,255,0,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                 {isListening ? (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="6" height="6"></rect><path d="M5 15V9"></path><path d="M19 15V9"></path></svg>
                 ) : (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                 )}
              </button>
           </div>
        </div>

        {/* Scanline Overlay for Video Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes breathe-and-walk {
          0% { transform: translateY(0) scale(1.02) rotate(0deg); }
          25% { transform: translateY(-4px) scale(1.03) rotate(0.5deg); }
          50% { transform: translateY(0) scale(1.02) rotate(0deg); }
          75% { transform: translateY(-4px) scale(1.03) rotate(-0.5deg); }
          100% { transform: translateY(0) scale(1.02) rotate(0deg); }
        }
        .animate-breathe-and-walk {
          animation: breathe-and-walk 3s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}} />
    </div>
  );
}
