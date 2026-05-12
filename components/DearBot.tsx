"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setChat([{ role: 'dear', content: "Hi! My name is **Dear**. I help AdTech professionals. How can I assist you today?" }]);
    }, 500);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      // Dampen the movement for a smooth parallax tilt
      setMousePos({ x: x * 0.02, y: y * 0.02 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      setChat(prev => [...prev, { role: 'dear', content: "I've analyzed your request. Let's optimize those campaigns for maximum ROI. Need anything else?" }]);
    }, 2000);
  };

  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === 'user') {
      return <div className="text-right text-xs bg-white/10 p-2.5 rounded-xl rounded-tr-sm ml-8 text-white shadow-md">{msg.content}</div>;
    }
    // Bold 'Dear' and render the message
    return (
      <div className="text-left text-xs bg-[#BEFF00]/10 border border-[#BEFF00]/30 p-2.5 rounded-xl rounded-tl-sm mr-8 text-white leading-relaxed shadow-lg shadow-[#BEFF00]/5">
        <span className="font-black text-[#BEFF00]">Dear</span>: {msg.content.replace(/\*\*Dear\*\*/g, '')}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-1000 ease-out transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
      
      {/* Widget Container */}
      <div 
        ref={containerRef}
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),_0_0_40px_rgba(190,255,0,0.1)] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'w-[340px] h-[580px]' : 'w-[280px] h-[380px] cursor-pointer group hover:border-white/30'}`}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        
        {/* Header (when open) */}
        {isOpen && (
           <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center pointer-events-auto">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
               <span className="text-[10px] font-black tracking-widest text-white/90 uppercase drop-shadow-md">Live Avatar</span>
             </div>
             <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
           </div>
        )}

        {/* Live Indicator (when closed) */}
        {!isOpen && (
          <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <span className="text-[9px] font-black tracking-widest text-white/90 uppercase">Live Stream</span>
          </div>
        )}

        {/* Dynamic Avatar (Parallax + Breathing) */}
        <div 
          className={`relative w-full ${isOpen ? 'h-[260px] shrink-0' : 'h-full'} overflow-hidden bg-white flex items-center justify-center transition-all duration-500 z-10 border-b border-white/10`}
          style={{ perspective: '1000px' }}
        >
           <div 
             className="absolute inset-[-10%] w-[120%] h-[120%] mix-blend-multiply"
             style={{ 
               transform: `rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg) translateZ(10px)`,
               transition: 'transform 0.1s ease-out'
             }}
           >
             <div className="absolute inset-0 animate-breathe">
               <Image 
                 src="/avatar.png"
                 alt="Dear Avatar"
                 fill
                 className="object-cover object-top filter contrast-105 brightness-105"
                 priority
               />
             </div>
           </div>
           {/* Dark Gradient Overlay for integration */}
           <div className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-20 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-80 pointer-events-none'}`}></div>
        </div>

        {/* Closed State Overlay */}
        {!isOpen && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
             <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3.5 flex items-center justify-between border border-white/10 shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="flex flex-col">
                   <span className="text-sm font-black text-white flex items-center gap-2">
                     Dear 
                     <span className="w-1.5 h-1.5 rounded-full bg-[#BEFF00]"></span>
                   </span>
                   <span className="text-[10px] font-bold text-gray-400">Click to chat...</span>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-[#BEFF00] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(190,255,0,0.4)] transition-all">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
             </div>
          </div>
        )}

        {/* Open State Chat UI */}
        {isOpen && (
          <div className="flex-1 flex flex-col bg-[#050505] relative z-20 h-full overflow-hidden">
             
             {/* Chat History */}
             <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                {chat.map((msg, i) => (
                  <React.Fragment key={i}>
                    {renderMessage(msg)}
                  </React.Fragment>
                ))}
                {isThinking && (
                  <div className="text-left text-xs bg-[#BEFF00]/5 border border-[#BEFF00]/10 p-2.5 rounded-xl rounded-tl-sm mr-8 text-[#BEFF00] flex items-center gap-2 w-max shadow-lg shadow-[#BEFF00]/5">
                    <span className="font-black">Dear</span> is thinking
                    <span className="flex gap-1 ml-1">
                      <span className="w-1 h-1 bg-[#BEFF00] rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 h-1 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </span>
                  </div>
                )}
             </div>

             {/* Chat Input */}
             <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-[#0a0a0a]">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Dear anything..." 
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#BEFF00]/50 transition-colors shadow-inner"
                    disabled={isThinking}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isThinking}
                    className="absolute right-2 w-8 h-8 rounded-lg bg-[#BEFF00] text-black flex items-center justify-center disabled:opacity-50 disabled:bg-white/10 disabled:text-white transition-all hover:bg-[#a5e000] shadow-md shadow-[#BEFF00]/20"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
             </form>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(190, 255, 0, 0.5);
        }
      `}} />
    </div>
  );
}
