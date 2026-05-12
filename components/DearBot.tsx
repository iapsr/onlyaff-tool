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
  const [avatarState, setAvatarState] = useState<'Walk' | 'Idle'>('Walk');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // Show widget after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Auto-popup introduction
      setTimeout(() => {
         setChat([{ role: 'dear', content: "Alpha team ready. I am **Dear**, your dedicated AdTech specialist. Click to command." }]);
      }, 1000);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAvatarClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setAvatarState('Idle');
      if (chat.length <= 1) {
         setChat([{ role: 'dear', content: "Holding position. What are your orders?" }]);
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
    setAvatarState('Idle');

    setTimeout(() => {
      setIsThinking(false);
      setChat(prev => [...prev, { role: 'dear', content: "Coordinates locked. Implementing these changes will drastically improve conversion rates. Proceed?" }]);
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
      
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-1000 ease-out transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
        
        {/* Auto-popup outside widget when pacing */}
        {!isOpen && chat.length > 0 && avatarState === 'Walk' && (
          <div className="absolute -top-24 right-0 bg-white text-black p-4 rounded-2xl rounded-br-sm shadow-2xl w-[280px] animate-in zoom-in duration-300 z-10 border-4 border-[#BEFF00]">
            <p className="text-sm font-bold leading-snug">
              <span className="font-black">Dear</span>: {chat[0].content.replace(/\*\*Dear\*\*/g, '')}
            </p>
            <div className="absolute -bottom-4 right-8 w-6 h-6 bg-white border-b-4 border-r-4 border-[#BEFF00] transform rotate-45"></div>
          </div>
        )}

        {/* Widget Container */}
        <div 
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),_0_0_40px_rgba(190,255,0,0.15)] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'w-[360px] h-[600px]' : 'w-[260px] h-[360px] cursor-pointer group hover:border-white/30 hover:shadow-[0_0_60px_rgba(190,255,0,0.3)]'}`}
          onClick={handleAvatarClick}
        >
          
          {/* Header (when open) */}
          {isOpen && (
             <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center pointer-events-auto backdrop-blur-sm">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#BEFF00] animate-pulse shadow-[0_0_10px_rgba(190,255,0,0.8)]"></div>
                 <span className="text-[10px] font-black tracking-widest text-[#BEFF00] uppercase drop-shadow-md">Tactical Uplink</span>
               </div>
               <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setAvatarState('Walk'); }} className="text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
             </div>
          )}

          {/* Dynamic 3D WebGL Avatar Embedded in Corner */}
          <div className={`relative w-full ${isOpen ? 'h-[280px] shrink-0' : 'h-full'} overflow-hidden bg-gradient-to-t from-[#111] to-[#333] flex items-center justify-center transition-all duration-500 z-10 border-b border-white/10`}>
             <div className={`absolute bottom-[-40px] w-[300px] h-[400px] transition-transform duration-500 ${avatarState === 'Walk' ? 'animate-pacing' : ''}`}>
                {/* @ts-ignore */}
                <model-viewer
                  src="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb"
                  autoplay
                  animation-name={avatarState}
                  shadow-intensity="1"
                  camera-orbit="-90deg 85deg 110%"
                  camera-target="0m 1m 0m"
                  disable-zoom
                  disable-pan
                  style={{ width: '100%', height: '100%', background: 'transparent' }}
                >
                {/* @ts-ignore */}
                </model-viewer>
             </div>
             {/* Dark Gradient Overlay */}
             <div className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-20 pointer-events-none transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-60'}`}></div>
          </div>

          {/* Closed State Overlay */}
          {!isOpen && (
            <div className="absolute bottom-5 left-5 right-5 z-20">
               <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between border border-white/10 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex flex-col">
                     <span className="text-base font-black text-white flex items-center gap-2">
                       Dear 
                       <span className="w-2 h-2 rounded-full bg-[#BEFF00] animate-pulse"></span>
                     </span>
                     <span className="text-xs font-bold text-gray-400 mt-0.5">Click to deploy...</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-[#BEFF00] group-hover:text-black transition-all">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
               </div>
            </div>
          )}

          {/* Open State Chat UI */}
          {isOpen && (
            <div className="flex-1 flex flex-col bg-[#050505] relative z-20 h-full overflow-hidden">
               
               {/* Chat History */}
               <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
                  {chat.map((msg, i) => (
                    <React.Fragment key={i}>
                      {renderMessage(msg)}
                    </React.Fragment>
                  ))}
                  {isThinking && (
                    <div className="text-left text-xs bg-[#BEFF00]/5 border border-[#BEFF00]/20 p-3 rounded-xl rounded-tl-sm mr-8 text-[#BEFF00] flex items-center gap-3 w-max shadow-lg shadow-[#BEFF00]/10">
                      <span className="font-black text-sm">Dear</span> is analyzing
                      <span className="flex gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 bg-[#BEFF00] rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      </span>
                    </div>
                  )}
               </div>

               {/* Chat Input */}
               <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-[#0a0a0a]">
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Give Dear a command..." 
                      className="w-full bg-black border border-white/20 rounded-xl py-3.5 pl-5 pr-14 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#BEFF00] transition-colors shadow-inner"
                      disabled={isThinking}
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={!input.trim() || isThinking}
                      className="absolute right-2 w-10 h-10 rounded-lg bg-[#BEFF00] text-black flex items-center justify-center disabled:opacity-50 disabled:bg-white/10 disabled:text-white transition-all hover:bg-[#a5e000] shadow-md shadow-[#BEFF00]/20"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                  </div>
               </form>
            </div>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Pacing back and forth inside the widget */
        @keyframes pacing {
          0% { transform: translateX(-30px); }
          50% { transform: translateX(30px); }
          100% { transform: translateX(-30px); }
        }
        .animate-pacing {
          animation: pacing 8s linear infinite;
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(190, 255, 0, 0.5);
        }
      `}} />
    </>
  );
}
