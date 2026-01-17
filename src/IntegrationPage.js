import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

/* --- 1. THE BACKGROUND PATTERN (PURPLE Matrix Rain) --- */
const Pattern = () => {
  return (
    <StyledWrapper>
      <div className="container" />
    </StyledWrapper>
  );
}

/* --- 2. THE CARD COMPONENT (PURPLE Theme) --- */
const IntegrationCard = ({ title, description, linkTo, icon, year }) => {
  return (
    <Link to={linkTo} className="block group">
      <div className="w-72 h-[380px] relative border border-solid border-purple-500/20 rounded-2xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-2">
        
        {/* Accent Layer (Purple) */}
        <div className="w-full h-full p-1 absolute bg-purple-600 transition-colors duration-500 group-hover:bg-purple-500">
          <div className="w-full h-full rounded-xl rounded-tr-[100px] rounded-br-[40px] bg-[#111]" />
        </div>

        {/* Spinning Orb Layer */}
        <div className="w-full h-full flex items-center justify-center relative backdrop-blur-lg rounded-2xl">
          <div 
            className="w-40 h-40 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-400 animate-spin blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
            style={{animationDuration: '8s'}} 
          />
        </div>

        {/* Content Layer */}
        <div className="w-full h-full p-4 flex justify-between absolute inset-0 z-10">
          
          {/* Main Card Content */}
          <div className="w-3/4 p-3 flex flex-col rounded-xl backdrop-blur-md bg-gray-900/60 border border-purple-500/10 text-gray-200 shadow-xl">
            <span className="text-3xl mb-2">{icon}</span>
            <span className="text-xl font-bold tracking-tight text-white mb-2 leading-tight">
              {title}
            </span>
            <span className="text-xs text-gray-400 font-medium leading-relaxed overflow-hidden">
              {description}
            </span>
            
            <div className="w-full mt-auto pt-4 flex items-center justify-start">
              <span className="text-xs font-mono text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
                EST. {year}
              </span>
            </div>
          </div>

          {/* Side Vertical Text */}
          <div className="h-full pt-2 flex flex-col items-end text-white/40 font-mono text-[10px] uppercase tracking-widest">
            <span className="writing-vertical-rl rotate-180 mb-1">METRO</span>
            <span className="writing-vertical-rl rotate-180">LINK</span>
            
            {/* Arrow Button */}
            <div className="w-10 h-10 mt-auto flex items-center justify-center rounded-full backdrop-blur-lg bg-purple-500/20 border border-purple-500/10 cursor-pointer transition-all duration-300 group-hover:bg-purple-500 group-hover:text-white text-white/70">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" className="w-4 h-4 transform group-hover:rotate-45 transition-transform duration-300">
                <path d="M4.646 2.146a.5.5 0 0 0 0 .708L7.793 6L4.646 9.146a.5.5 0 1 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z" fill="currentColor" />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}

/* --- 3. MAIN PAGE COMPONENT --- */
function IntegrationPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none"> 
        <Pattern />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-4">
        
        {/* Header */}
        <div className="text-center mb-20 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-500 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                MULTI-MODAL ANALYSIS
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                Bridge the gap between Metro and Bus services to solve Last-Mile Connectivity.
            </p>
        </div>

        {/* Cards Grid */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            
            {/* CARD 1: FEEDER PLANNER */}
            <IntegrationCard 
                title="Metro Feeder Designer"
                //icon=""
                description="Plan new feeder routes to connect neighborhoods to Metro stations. Calculates ROI & Impact."
                year="2025"
                linkTo="/planner"
            />

            {/* CARD 2: CATCHMENT ANALYSIS */}
            <IntegrationCard 
                title="Catchment Analysis"
                //icon="🔍"
                description="Identify under-utilized Metro stations due to poor bus connectivity (Transport Deserts)."
                year="2025"
                linkTo="/gaps"
            />

        </div>
      </div>
    </div>
  );
}

/* --- 4. STYLED COMPONENT DEFINITION (Purple Matrix Rain) --- */
const StyledWrapper = styled.div`
  .container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .container::before {
    content: "";
    position: absolute;
    inset: -140%;
    rotate: -45deg;

    /* Lifted base (NOT pure black) */
    background: #030712;

    background-image:
      radial-gradient(4px 80px at 0px 150px, rgba(168, 85, 247, 1), transparent),
      radial-gradient(4px 80px at 300px 150px, rgba(217, 70, 239, 1), transparent),
      radial-gradient(2px 2px at 150px 75px, rgba(232, 121, 249, 1), transparent),

      radial-gradient(4px 80px at 0px 250px, rgba(147, 51, 234, 1), transparent),
      radial-gradient(4px 80px at 300px 250px, rgba(236, 72, 153, 1), transparent),
      radial-gradient(2px 2px at 150px 125px, rgba(240, 171, 252, 1), transparent),

      radial-gradient(4px 80px at 0px 200px, rgba(126, 34, 206, 1), transparent),
      radial-gradient(4px 80px at 300px 200px, rgba(232, 121, 249, 1), transparent),
      radial-gradient(2px 2px at 150px 100px, rgba(216, 180, 254, 1), transparent);

    background-size:
      300px 180px, 300px 180px, 300px 180px,
      300px 280px, 300px 280px, 300px 280px,
      300px 230px, 300px 230px, 300px 230px;


    mix-blend-mode: screen;
    filter: brightness(1.45) saturate(1.5);

    animation: rain 200s linear infinite;
  }

  @keyframes rain {
    0% {
      background-position:
        0px 150px, 3px 150px, 150px 225px,
        25px 250px, 28px 250px, 176px 375px,
        50px 200px, 53px 200px, 201px 300px;
    }
    100% {
      background-position:
        0px 4500px, 3px 4500px, 150px 4575px,
        25px 7500px, 28px 7500px, 176px 7625px,
        50px 6000px, 53px 6000px, 201px 6100px;
    }
  }
`;


export default IntegrationPage;