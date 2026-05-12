"use client";

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

interface ChatMessage {
  role: 'user' | 'dear';
  content: string;
}

export default function DearBot() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  // Interaction states
  const [isHovered, setIsHovered] = useState(false);
  const [animation, setAnimation] = useState('Run');
  const [orbit, setOrbit] = useState('-90deg 85deg 105%');
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    const handleMouseMove = (e: MouseEvent) => {
      if (!characterRef.current) return;
      const rect = characterRef.current.getBoundingClientRect();
      const charX = rect.left + rect.width / 2;
      const charY = rect.top + rect.height / 2;
      
      // Calculate cursor position relative to character
      const deltaX = e.clientX - charX;
      const deltaY = e.clientY - charY;
      
      // Map deltaX to a rotation angle (simulate eye contact by rotating the model towards cursor)
      // Base is -90deg (facing forward relative to movement)
      const maxRotation = 45; // Max degrees to turn head/body
      const rotationY = -90 + (deltaX / window.innerWidth) * maxRotation * 2;
      
      // Pitch tracking (up/down)
      const pitch = 85 + (deltaY / window.innerHeight) * 20;

      setOrbit(`${rotationY}deg ${pitch}deg 105%`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleInteraction = () => {
    if (!isOpen) {
      setIsOpen(true);
      setAnimation('Idle');
      if (chat.length === 0) {
         setChat([{ role: 'dear', content: "I'm listening. What do you need optimized today?" }]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      setChat(prev => [...prev, { role: 'dear', content: "Request acknowledged. I will process these parameters immediately." }]);
    }, 2500);
  };

  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === 'user') {
      return <div className="text-right text-xs bg-white/10 p-3 rounded-xl rounded-tr-sm ml-8 text-white shadow-md font-medium">{msg.content}</div>;
    }
    return (
      <div className="text-left text-xs bg-[#BEFF00]/10 border border-[#BEFF00]/30 p-3 rounded-xl rounded-tl-sm mr-8 text-white leading-relaxed shadow-lg shadow-[#BEFF00]/5">
        <span className="font-black text-[#BEFF00]">Dear</span>: {msg.content.replace(/\*\*Dear\*\*/g, '')}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <>
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></Script>
      
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        
        {/* Walking Avatar Stage */}
        <div 
          className={`absolute bottom-0 ${isHovered || isOpen ? 'animation-pause' : 'animate-walk-around'}`}
          style={{ left: '0%' }}
        >
          <div 
            ref={characterRef}
            className="relative flex flex-col items-center pointer-events-auto cursor-pointer group"
            onMouseEnter={() => {
              setIsHovered(true);
              setAnimation('Idle');
            }}
            onMouseLeave={() => {
              if (!isOpen) {
                setIsHovered(false);
                setAnimation('Run');
              }
            }}
            onClick={handleInteraction}
          >
            {/* Auto-popup when walking (and not open) */}
            {!isOpen && chat.length === 0 && (
              <div className="absolute -top-16 bg-white/90 backdrop-blur-md text-black p-4 rounded-2xl rounded-br-sm shadow-2xl w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-[#BEFF00]">
                <p className="text-sm font-bold leading-snug">Click to command <span className="font-black">Dear</span></p>
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white/90 border-b border-r border-[#BEFF00] transform rotate-45"></div>
              </div>
            )}

            {/* Expanding Chat Interface attached to the Avatar */}
            {isOpen && (
              <div className="absolute -top-[340px] bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),_0_0_40px_rgba(190,255,0,0.15)] rounded-3xl w-[320px] h-[400px] flex flex-col z-20 overflow-hidden transform transition-all duration-500 scale-100">
                 {/* Header */}
                 <div className="p-4 bg-black/50 flex justify-between items-center border-b border-white/10">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#BEFF00] animate-pulse"></div>
                     <span className="text-[10px] font-black tracking-widest text-[#BEFF00] uppercase">Active Uplink</span>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsHovered(false); setAnimation('Run'); }} className="text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                 </div>
                 
                 {/* Chat History */}
                 <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                    {chat.map((msg, i) => (
                      <React.Fragment key={i}>
                        {renderMessage(msg)}
                      </React.Fragment>
                    ))}
                    {isThinking && (
                      <div className="text-left text-xs bg-[#BEFF00]/5 border border-[#BEFF00]/20 p-3 rounded-xl rounded-tl-sm mr-8 text-[#BEFF00] flex items-center gap-3 w-max">
                        <span className="font-black text-sm">Dear</span> is analyzing
                        <span className="flex gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 bg-[#BEFF00] rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-1.5 h-1.5 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Input */}
                 <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-[#0a0a0a]">
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Give Dear a command..." 
                        className="w-full bg-black border border-white/20 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#BEFF00]"
                        disabled={isThinking}
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        disabled={!input.trim() || isThinking}
                        className="absolute right-1.5 w-8 h-8 rounded-lg bg-[#BEFF00] text-black flex items-center justify-center disabled:opacity-50 transition-all hover:bg-[#a5e000]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    </div>
                 </form>
              </div>
            )}

            {/* 3D BGMI-style Avatar */}
            <div className={`relative w-[320px] h-[450px] drop-shadow-[0_40px_40px_rgba(0,0,0,0.9)] transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}>
              {/* @ts-ignore */}
              <model-viewer
                src="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb"
                autoplay
                animation-name={animation}
                shadow-intensity="2"
                camera-orbit={orbit}
                camera-target="0m 1.2m 0m"
                disable-zoom
                disable-pan
                style={{ width: '100%', height: '100%', background: 'transparent' }}
              >
              {/* @ts-ignore */}
              </model-viewer>
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
            animation: walk-around 30s linear infinite;
          }
          .animation-pause {
            animation-play-state: paused !important;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(190, 255, 0, 0.2);
            border-radius: 4px;
          }
        `}} />
      </div>
    </>
  );
}
