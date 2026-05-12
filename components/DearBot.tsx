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
  const [avatarState, setAvatarState] = useState<'walking' | 'idle' | 'thinking' | 'replying'>('walking');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Boss walks into the screen
    const timer = setTimeout(() => {
      setIsVisible(true);
      setAvatarState('walking');
      // Auto-popup introduction
      setTimeout(() => {
         setChat([{ role: 'dear', content: "Hi there. I am **Dear**, your dedicated AdTech specialist. Click me when you're ready to optimize." }]);
      }, 1500);
    }, 500);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || avatarState === 'walking') return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      setMousePos({ x: x * 0.03, y: y * 0.03 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [avatarState]);

  const handleAvatarClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setAvatarState('idle');
      if (chat.length <= 1) {
         setChat([{ role: 'dear', content: "Excellent. Let's get to work. What do you need help with?" }]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || avatarState === 'thinking') return;

    const userMessage = input.trim();
    setInput('');
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setAvatarState('thinking');

    setTimeout(() => {
      setAvatarState('replying');
      setChat(prev => [...prev, { role: 'dear', content: "I've reviewed the parameters. Implementing these changes will drastically improve conversion rates. Proceed?" }]);
      
      setTimeout(() => setAvatarState('idle'), 2000);
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

  // Determine current animation class
  const getAnimationClass = () => {
    switch(avatarState) {
      case 'walking': return 'animate-boss-walk';
      case 'thinking': return 'animate-think-pose';
      case 'replying': return 'animate-reply-pose';
      case 'idle': return 'animate-breathe';
      default: return '';
    }
  };

  return (
    <div className={`fixed bottom-6 z-[100] transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100' : 'translate-x-[120%] opacity-0'} ${avatarState === 'walking' ? 'animate-strut-across' : 'right-6'}`}>
      
      {/* Auto-popup outside widget when walking */}
      {!isOpen && chat.length > 0 && avatarState === 'walking' && (
        <div className="absolute -top-24 right-0 bg-white text-black p-4 rounded-2xl rounded-br-sm shadow-2xl w-[280px] animate-in zoom-in duration-300 z-10 border-4 border-[#BEFF00]">
          <p className="text-sm font-bold leading-snug">
            <span className="font-black">Dear</span>: {chat[0].content.replace(/\*\*Dear\*\*/g, '')}
          </p>
          <div className="absolute -bottom-4 right-8 w-6 h-6 bg-white border-b-4 border-r-4 border-[#BEFF00] transform rotate-45"></div>
        </div>
      )}

      {/* Widget Container */}
      <div 
        ref={containerRef}
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#050505] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),_0_0_40px_rgba(190,255,0,0.15)] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'w-[360px] h-[600px]' : 'w-[260px] h-[360px] cursor-pointer group hover:border-white/30 hover:shadow-[0_0_60px_rgba(190,255,0,0.3)]'}`}
        onClick={handleAvatarClick}
      >
        
        {/* Header (when open) */}
        {isOpen && (
           <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center pointer-events-auto backdrop-blur-sm">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#BEFF00] animate-pulse shadow-[0_0_10px_rgba(190,255,0,0.8)]"></div>
               <span className="text-[10px] font-black tracking-widest text-[#BEFF00] uppercase drop-shadow-md">Active Session</span>
             </div>
             <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setAvatarState('idle'); }} className="text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
           </div>
        )}

        {/* Dynamic Avatar */}
        <div 
          className={`relative w-full ${isOpen ? 'h-[280px] shrink-0' : 'h-full'} overflow-hidden bg-white flex items-center justify-center transition-all duration-500 z-10 border-b border-white/10`}
          style={{ perspective: '1000px' }}
        >
           <div 
             className={`absolute inset-[-10%] w-[120%] h-[120%] mix-blend-multiply transition-transform duration-300 ${getAnimationClass()}`}
             style={{ 
               transform: avatarState !== 'walking' ? `rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg) translateZ(10px)` : 'none'
             }}
           >
               <Image 
                 src="/avatar.png"
                 alt="Dear Avatar"
                 fill
                 className={`object-cover object-top filter contrast-105 brightness-105 transition-all duration-500`}
                 priority
               />
           </div>
           {/* Dark Gradient Overlay */}
           <div className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-20 pointer-events-none transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-60'}`}></div>
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
                   <span className="text-xs font-bold text-gray-400 mt-0.5">Click to consult...</span>
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
                {avatarState === 'thinking' && (
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
                    disabled={avatarState === 'thinking'}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || avatarState === 'thinking'}
                    className="absolute right-2 w-10 h-10 rounded-lg bg-[#BEFF00] text-black flex items-center justify-center disabled:opacity-50 disabled:bg-white/10 disabled:text-white transition-all hover:bg-[#a5e000] shadow-md shadow-[#BEFF00]/20"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
             </form>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Strut across screen */
        @keyframes strut-across {
          0% { right: -300px; }
          10% { right: 5%; }
          90% { right: 5%; }
          100% { right: -300px; }
        }
        .animate-strut-across {
          animation: strut-across 30s ease-in-out infinite;
        }

        /* Boss Walk (squash, stretch, rotate) */
        @keyframes boss-walk {
          0%, 100% { transform: translateY(0px) rotate(0deg) scaleY(1); }
          25% { transform: translateY(-12px) rotate(1.5deg) scaleY(1.02); }
          50% { transform: translateY(0px) rotate(0deg) scaleY(1); }
          75% { transform: translateY(-12px) rotate(-1.5deg) scaleY(1.02); }
        }
        .animate-boss-walk {
          animation: boss-walk 1.2s ease-in-out infinite;
        }

        /* Thinking Pose (leaning in, subtle tilt) */
        @keyframes think-pose {
          0% { transform: scale(1) rotate(0deg) translateX(0); }
          50% { transform: scale(1.04) rotate(1.5deg) translateX(-4px) translateY(4px); }
          100% { transform: scale(1) rotate(0deg) translateX(0); }
        }
        .animate-think-pose {
          animation: think-pose 2s ease-in-out infinite;
        }

        /* Replying Pose (confident nod) */
        @keyframes reply-pose {
          0% { transform: scale(1) translateY(0); }
          20% { transform: scale(1.05) translateY(-5px); }
          50% { transform: scale(1.02) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
        }
        .animate-reply-pose {
          animation: reply-pose 1s ease-out;
        }

        /* Idle Breathe */
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
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
    </div>
  );
}
