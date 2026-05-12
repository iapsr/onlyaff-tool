"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';

export default function DearBot() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [animation, setAnimation] = useState('Run');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      typeMessage("Alpha team, moving out! I am Dear, your optimization specialist.");
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
    setAnimation('Idle');
    typeMessage("Holding position. Ready for your command! 🚀");
  };

  if (!isVisible) return null;

  return (
    <>
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></Script>
      
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {/* Walking Avatar Container */}
        <div 
          className={`absolute bottom-0 ${isHovered ? 'animation-pause' : 'animate-walk-around'}`}
          style={{ left: '0%' }}
        >
          <div 
            className="relative flex flex-col items-center pointer-events-auto cursor-pointer"
            onMouseEnter={() => {
              setIsHovered(true);
              setAnimation('Idle');
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setAnimation('Run');
            }}
            onClick={handleInteraction}
          >
            {/* Chat Bubble */}
            {message && (
              <div className="absolute -top-16 bg-white/90 backdrop-blur-md text-black p-4 rounded-2xl rounded-br-sm shadow-2xl max-w-[280px] w-max animate-in zoom-in duration-300 z-10 border border-white/20">
                <p className="text-sm font-bold leading-snug">{message}</p>
                <div className="absolute -bottom-3 right-6 w-4 h-4 bg-white/90 transform rotate-45"></div>
              </div>
            )}

            {/* 3D BGMI-style Soldier Avatar */}
            <div className="relative w-[300px] h-[400px] drop-shadow-[0_30px_30px_rgba(0,0,0,0.8)]">
              {/* @ts-ignore */}
              <model-viewer
                src="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb"
                autoplay
                animation-name={animation}
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
            animation: walk-around 15s linear infinite;
          }
          .animation-pause {
            animation-play-state: paused !important;
          }
        `}} />
      </div>
    </>
  );
}
