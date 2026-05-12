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
  
  // Base orbit for running is 270deg (facing right). CSS scaleX(-1) handles the flip when running left.
  // 180deg faces front.
  const [orbit, setOrbit] = useState('270deg 85deg 105%');
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    const handleMouseMove = (e: MouseEvent) => {
      if (!characterRef.current) return;
      
      // If we are NOT hovering or interacting, keep him facing the direction of travel (270deg faces right)
      if (!isHovered && !isOpen) {
        setOrbit('270deg 85deg 105%');
        return;
      }

      // If we ARE interacting, he should face the FRONT (180deg) and track the cursor slightly.
      const rect = characterRef.current.getBoundingClientRect();
      const charX = rect.left + rect.width / 2;
      const charY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - charX;
      const deltaY = e.clientY - charY;
      
      // Base is 180deg (facing front).
      // Decreasing the orbit moves the camera left, which makes the character appear to look right.
      const maxRotation = 45; 
      const rotationY = 180 - (deltaX / window.innerWidth) * maxRotation * 2;
      
      const pitch = 85 + (deltaY / window.innerHeight) * 20;

      setOrbit(`${rotationY}deg ${pitch}deg 105%`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered, isOpen]);

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
      return (
        <div className="flex justify-end mb-4 w-full">
          <div className="max-w-[85%] bg-[#0A7CFF] text-white px-4 py-2.5 text-[14px] font-medium leading-relaxed rounded-[20px] rounded-br-[4px] shadow-sm">
            {msg.content}
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-start mb-4 w-full">
        <div className="max-w-[85%] bg-[#E9E9EB] text-black px-4 py-2.5 text-[14px] font-medium leading-relaxed rounded-[20px] rounded-bl-[4px] shadow-sm">
          <span className="font-bold block mb-0.5 opacity-80 text-xs">Dear</span>
          {msg.content.replace(/\*\*Dear\*\*/g, '')}
        </div>
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
            className="relative flex flex-col items-center pointer-events-auto cursor-crosshair group"
            onMouseEnter={() => {
              setIsHovered(true);
              setAnimation('Idle');
              // Instantly face front when hovered
              setOrbit('180deg 85deg 105%');
            }}
            onMouseLeave={() => {
              if (!isOpen) {
                setIsHovered(false);
                setAnimation('Run');
                // Face running direction
                setOrbit('270deg 85deg 105%');
              }
            }}
            onClick={handleInteraction}
          >
            {/* Auto-popup when walking (and not open) */}
            {!isOpen && chat.length === 0 && (
              <div className="absolute -top-16 bg-white/90 backdrop-blur-md text-black p-4 rounded-2xl rounded-br-[4px] shadow-2xl w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-[#BEFF00]">
                <p className="text-sm font-bold leading-snug">Click to command <span className="font-black">Dear</span></p>
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white/90 border-b border-r border-[#BEFF00] transform rotate-45"></div>
              </div>
            )}

            {/* Expanding Chat Interface attached to the Avatar (iPhone style) */}
            {isOpen && (
              <div className="absolute -top-[360px] bg-[#F3F3F3] shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[32px] w-[340px] h-[450px] flex flex-col z-20 overflow-hidden transform transition-all duration-500 scale-100 border-4 border-white">
                 {/* Header */}
                 <div className="px-5 py-3 bg-[#F9F9F9] flex justify-between items-center border-b border-gray-200 backdrop-blur-md">
                   <div className="flex flex-col">
                     <span className="text-[15px] font-bold text-black flex items-center gap-1.5">
                       Dear
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     </span>
                     <span className="text-[11px] text-gray-500 font-medium">AdTech Specialist</span>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsHovered(false); setAnimation('Run'); setOrbit('270deg 85deg 105%'); }} className="text-blue-500 hover:text-blue-600 p-1 font-semibold text-sm">
                     Close
                   </button>
                 </div>
                 
                 {/* Chat History */}
                 <div className="flex-1 overflow-y-auto p-4 flex flex-col custom-scrollbar bg-white">
                    {chat.map((msg, i) => (
                      <React.Fragment key={i}>
                        {renderMessage(msg)}
                      </React.Fragment>
                    ))}
                    {isThinking && (
                      <div className="flex justify-start mb-4 w-full">
                        <div className="bg-[#E9E9EB] px-4 py-3 rounded-[20px] rounded-bl-[4px] shadow-sm flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                      </div>
                    )}
                 </div>

                 {/* Input (iPhone iMessage style) */}
                 <form onSubmit={handleSubmit} className="p-3 bg-[#F9F9F9] border-t border-gray-200">
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="iMessage" 
                        className="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-4 pr-10 text-[14px] text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                        disabled={isThinking}
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        disabled={!input.trim() || isThinking}
                        className="absolute right-1 w-8 h-8 rounded-full bg-[#0A7CFF] text-white flex items-center justify-center disabled:bg-gray-300 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    </div>
                 </form>
              </div>
            )}

            {/* 3D BGMI-style Avatar (Larger & 3D Hovering) */}
            <div className={`relative w-[380px] h-[550px] drop-shadow-[0_40px_40px_rgba(0,0,0,0.9)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isHovered ? 'animate-hover-float scale-110' : 'scale-100 translate-y-0'}`}>
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
          
          /* 3D Hover Floating Physics */
          @keyframes hover-float {
            0%, 100% { transform: translateY(0px) scale(1.15); filter: drop-shadow(0 40px 40px rgba(0,0,0,0.9)); }
            50% { transform: translateY(-20px) scale(1.15); filter: drop-shadow(0 60px 50px rgba(0,0,0,0.6)); }
          }
          .animate-hover-float {
            animation: hover-float 4s ease-in-out infinite;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #D1D1D6;
            border-radius: 4px;
          }
        `}} />
      </div>
    </>
  );
}
