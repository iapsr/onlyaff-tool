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
  const [orbit, setOrbit] = useState('90deg 85deg 105%');
  
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  
  // New interaction logic: Bot patrols ONLY if cursor is idle for 2s.
  const [isMouseIdle, setIsMouseIdle] = useState(true);
  const isWalking = isMouseIdle && !isOpen && !isHovered;
  
  const characterRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initial mount delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Sync state to animations/orbit
  useEffect(() => {
    if (isWalking) {
      setAnimation('Run');
      setOrbit('90deg 85deg 105%');
    } else {
      setAnimation('Idle');
    }
  }, [isWalking]);

  // Global Mouse Tracking & Idle Timer
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setIsMouseIdle(false);
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      // Update cursor tracking orientation centered on 0deg (Front Face)
      if (characterRef.current) {
        const rect = characterRef.current.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - charX;
        const deltaY = e.clientY - charY;
        
        // Directly map X offset to orbit: moving right (deltaX>0) means negative orbit.
        const rotationY = 0 - (deltaX / window.innerWidth) * 70;
        const pitch = 85 + (deltaY / window.innerHeight) * 15;

        setOrbit(`${rotationY}deg ${pitch}deg 105%`);
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsMouseIdle(true);
      }, 2000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    idleTimer = setTimeout(() => setIsMouseIdle(true), 2000);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, isThinking, isOpen]);

  const handleInteraction = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (chat.length === 0) {
         setChat([{ role: 'dear', content: "I am ready. What parameters do we need to optimize?" }]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    const newChat: ChatMessage[] = [...chat, { role: 'user', content: userMessage }];
    setChat(newChat);
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newChat }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setChat(prev => [...prev, { role: 'dear', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setChat(prev => [...prev, { role: 'dear', content: "My connection to the mainframe was interrupted. Please try again." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === 'user') {
      return (
        <div className="flex justify-end w-full">
          <div className="w-fit max-w-[95%] bg-[#BEFF00] text-black px-6 py-3.5 text-[15px] font-medium leading-relaxed rounded-[24px] rounded-br-[6px] shadow-[0_0_40px_rgba(190,255,0,0.2)] animate-imessage-user pointer-events-auto">
            {msg.content}
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-start w-full">
        <div className="w-fit max-w-[95%] bg-[#1E1E1E] border border-[#333333] text-white px-6 py-4 text-[15px] leading-relaxed rounded-[24px] rounded-bl-[6px] shadow-2xl animate-imessage-bot pointer-events-auto">
          <span className="font-bold block mb-3 text-[#BEFF00] text-[11px] tracking-widest uppercase">DEAR</span>
          <div 
            className="dear-html-content space-y-3"
            dangerouslySetInnerHTML={{ __html: msg.content.replace(/\bDear\b/gi, '<strong class="font-black text-[#BEFF00]">Dear</strong>') }}
          ></div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <>
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></Script>
      
      {/* Premium Animated Sci-Fi Reticle Cursor */}
      {isHovered && (
        <div 
          className="fixed pointer-events-none z-[200] w-12 h-12 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <div className="absolute inset-0 border-2 border-[#BEFF00] rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-2 border border-[#BEFF00]/40 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#BEFF00] rounded-full shadow-[0_0_12px_#BEFF00]" />
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        
        {/* Full-screen Glass Blur when chat is open */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-all duration-700 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => { setIsOpen(false); setIsHovered(false); }}
        />

        {/* Walking Avatar Stage - Anchored to right side */}
        <div 
          className={`absolute bottom-0 animate-patrol-x ${isWalking ? '' : 'animation-pause'}`}
          style={{ right: '5%' }}
        >
          <div 
            ref={characterRef}
            className="relative flex flex-col items-center pointer-events-auto cursor-none group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleInteraction}
          >
            {/* Auto-popup hover bubble */}
            {!isOpen && isHovered && (
              <div className="absolute -top-4 bg-[#1E1E1E] border border-[#333333] text-white p-5 rounded-[24px] shadow-2xl w-max max-w-[320px] animate-in zoom-in duration-300 z-10 cursor-none">
                <span className="font-bold block mb-2 text-[#BEFF00] text-[11px] tracking-widest uppercase">DEAR</span>
                <p className="text-[14px] leading-relaxed">
                  Hi My Name is <span className="font-black text-[#BEFF00]">Dear</span>, if you are AdTech professional than I am your assistant?
                </p>
              </div>
            )}

            {/* Floating Chat Interface container (pointer-events-none wrapper prevents blocking exit clicks) */}
            {isOpen && (
              <div 
                className="absolute bottom-[400px] right-0 w-[90vw] max-w-[600px] flex flex-col z-20 pointer-events-none cursor-auto"
                style={{ maxHeight: 'calc(100vh - 420px)' }}
              >
                 
                 {/* Chat History Container */}
                 <div 
                   ref={chatContainerRef} 
                   className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col custom-scrollbar pointer-events-auto"
                   onClick={(e) => {
                     // Clicking empty spaces inside the chat column seamlessly closes the interface
                     if (e.target === e.currentTarget) {
                       setIsOpen(false);
                     }
                   }}
                 >
                    <div className="mt-auto flex flex-col gap-6 pointer-events-none">
                      {chat.map((msg, i) => (
                        <React.Fragment key={i}>
                          {renderMessage(msg)}
                        </React.Fragment>
                      ))}
                      {isThinking && (
                        <div className="flex justify-start w-full animate-imessage-bot pointer-events-auto">
                          <div className="w-fit bg-[#1E1E1E] border border-[#333333] px-6 py-5 rounded-[24px] rounded-bl-[6px] shadow-2xl flex gap-2 items-center">
                            <span className="w-2 h-2 bg-[#BEFF00] rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                            <span className="w-2 h-2 bg-[#BEFF00] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                          </div>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Dark Input Pill */}
                 <form onSubmit={handleSubmit} className="px-4 pt-2 pb-2 shrink-0 pointer-events-auto">
                    <div className="relative flex items-center bg-[#050505] border border-[#2A2A2A] rounded-full shadow-2xl overflow-hidden transition-all focus-within:border-[#444444]">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Command Dear..." 
                        className="w-full bg-transparent py-4 pl-6 pr-14 text-[15px] text-white placeholder:text-gray-500 focus:outline-none"
                        disabled={isThinking}
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 w-10 h-10 rounded-full bg-[#1A1A1A] text-gray-400 flex items-center justify-center disabled:opacity-50 transition-colors hover:text-white hover:bg-[#2A2A2A]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    </div>
                 </form>
              </div>
            )}

            {/* 3D BGMI-style Avatar Wrapper for Hover Scaling */}
            <div className={`relative w-[380px] h-[550px] drop-shadow-[0_40px_40px_rgba(0,0,0,0.9)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isHovered ? 'scale-110 -translate-y-4' : 'scale-100 translate-y-0'}`}>
              {/* Inner container specifically decoupled. Stripping the patrol-turn class when paused prevents CSS rotateY mirroring of mouse tracking */}
              <div className={`w-full h-full ${isWalking ? 'animate-patrol-turn' : ''}`}>
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
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes patrol-x {
            0% { transform: translateX(5vw); }
            45% { transform: translateX(-85vw); }
            50% { transform: translateX(-85vw); }
            95% { transform: translateX(5vw); }
            100% { transform: translateX(5vw); }
          }
          @keyframes patrol-turn {
            0% { transform: rotateY(180deg); }
            45% { transform: rotateY(180deg); }
            50% { transform: rotateY(0deg); }
            95% { transform: rotateY(0deg); }
            100% { transform: rotateY(180deg); }
          }
          .animate-patrol-x {
            animation: patrol-x 30s ease-in-out infinite;
          }
          .animate-patrol-turn {
            animation: patrol-turn 30s ease-in-out infinite;
          }
          .animation-pause {
            animation-play-state: paused !important;
          }
          
          /* Apple iMessage Spring Wave Animation */
          @keyframes imessage-spring {
            0% { transform: scale(0.6) translateY(20px); opacity: 0; }
            50% { transform: scale(1.05) translateY(-5px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          .animate-imessage-user {
            animation: imessage-spring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            transform-origin: bottom right;
          }
          .animate-imessage-bot {
            animation: imessage-spring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            transform-origin: bottom left;
          }

          /* HTML Formatting specific to Dear's responses */
          .dear-html-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .dear-html-content li {
            margin-bottom: 0.25rem;
          }

          /* Premium Scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px; 
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(190, 255, 0, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(190, 255, 0, 0.5);
          }
        `}} />
      </div>
    </>
  );
}
