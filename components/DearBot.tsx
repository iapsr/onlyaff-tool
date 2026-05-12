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
  
  const [isHovered, setIsHovered] = useState(false);
  const [animation, setAnimation] = useState('Run');
  const [orbit, setOrbit] = useState('-90deg 85deg 105%');
  const characterRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    const handleMouseMove = (e: MouseEvent) => {
      if (!characterRef.current) return;
      
      if (!isHovered && !isOpen) {
        setOrbit('-90deg 85deg 105%');
        return;
      }

      const rect = characterRef.current.getBoundingClientRect();
      const charX = rect.left + rect.width / 2;
      const charY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - charX;
      const deltaY = e.clientY - charY;
      
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

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, isThinking, isOpen]);

  const handleInteraction = () => {
    if (!isOpen) {
      setIsOpen(true);
      setAnimation('Idle');
      if (chat.length === 0) {
         setChat([{ role: 'dear', content: "I am ready. What parameters do we need to optimize?" }]);
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
        <div className="flex justify-end w-full animate-in slide-in-from-bottom-2 duration-300">
          <div className="relative max-w-[85%] bg-[#BEFF00]/90 backdrop-blur-xl border border-[#BEFF00]/50 text-black px-5 py-3.5 text-[14px] font-medium leading-relaxed rounded-[24px] rounded-br-[6px] shadow-[0_10px_40px_rgba(190,255,0,0.2)]">
            {msg.content}
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-start w-full animate-in slide-in-from-bottom-2 duration-300">
        <div className="relative max-w-[85%] bg-white/10 backdrop-blur-2xl border border-white/20 text-white px-5 py-3.5 text-[14px] font-medium leading-relaxed rounded-[24px] rounded-bl-[6px] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <span className="font-black block mb-1 text-[#BEFF00] drop-shadow-md text-xs tracking-wider uppercase">Dear</span>
          <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\bDear\b/gi, '<strong class="font-black text-[#BEFF00]">Dear</strong>').replace(/\*\*/g, '') }}></span>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <>
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></Script>
      
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        
        {/* Full-screen Glass Blur when chat is open */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-700 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => { setIsOpen(false); setIsHovered(false); setAnimation('Run'); setOrbit('-90deg 85deg 105%'); }}
        />

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
              setOrbit('180deg 85deg 105%'); 
            }}
            onMouseLeave={() => {
              if (!isOpen) {
                setIsHovered(false);
                setAnimation('Run');
                setOrbit('-90deg 85deg 105%'); 
              }
            }}
            onClick={handleInteraction}
          >
            {/* Auto-popup hover bubble (Glassy) */}
            {!isOpen && isHovered && (
              <div className="absolute -top-4 bg-white/10 backdrop-blur-xl text-white p-4 rounded-[24px] rounded-br-[6px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[300px] animate-in zoom-in duration-200 z-10 border border-white/20">
                <p className="text-sm font-medium leading-relaxed">
                  Hi My Name is <span className="font-black text-[#BEFF00]">Dear</span>, if you are AdTech professional than I am your assistant?
                </p>
              </div>
            )}

            {/* Floating Glass Chat Bubbles */}
            {isOpen && (
              <div className="absolute bottom-[400px] w-[400px] flex flex-col z-20 pointer-events-auto">
                 
                 {/* Chat History Container (No solid background) */}
                 <div ref={chatContainerRef} className="max-h-[50vh] overflow-y-auto px-4 pb-2 flex flex-col gap-4 custom-scrollbar">
                    <div className="flex flex-col justify-end min-h-full gap-4">
                      {chat.map((msg, i) => (
                        <React.Fragment key={i}>
                          {renderMessage(msg)}
                        </React.Fragment>
                      ))}
                      {isThinking && (
                        <div className="flex justify-start w-full animate-in fade-in duration-300">
                          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-5 py-4 rounded-[24px] rounded-bl-[6px] shadow-lg flex gap-1.5 items-center">
                            <span className="w-2 h-2 bg-[#BEFF00] rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                            <span className="w-2 h-2 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                          </div>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Input Pill (Glassy) */}
                 <form onSubmit={handleSubmit} className="px-4 pt-2 pb-6">
                    <div className="relative flex items-center bg-black/40 backdrop-blur-2xl border border-white/20 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden transition-all focus-within:border-[#BEFF00]/50 focus-within:bg-black/60">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Command Dear..." 
                        className="w-full bg-transparent py-4 pl-6 pr-14 text-[15px] text-white placeholder:text-gray-400 focus:outline-none"
                        disabled={isThinking}
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 w-10 h-10 rounded-full bg-[#BEFF00] text-black flex items-center justify-center disabled:bg-white/10 disabled:text-white/30 transition-colors shadow-lg hover:bg-[#a5e000]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    </div>
                 </form>
              </div>
            )}

            {/* 3D BGMI-style Avatar */}
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
            width: 0px; /* Hide scrollbar for cleaner look */
          }
        `}} />
      </div>
    </>
  );
}
