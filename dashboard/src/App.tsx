import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import ControlPanel from "./components/ControlPanel";
import DocsPage from "./components/DocsPage";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    
    // Intercept manual pushState triggers to sync React state immediately
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    // Smooth scroll to top on page transition
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#E0E0E0] font-sans flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      
      {/* TOP NAVIGATION / BRANDING WITH RGB GLOW BACKGROUND */}
      <header className="border-b border-slate-900/80 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-baseline shrink-0 gap-4 bg-[#050505] relative overflow-hidden">
        {/* Subtle header background ray */}
        <div className="absolute top-0 right-10 w-[200px] h-[80px] bg-gradient-to-br from-cyan-500/10 to-transparent blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-10 w-[200px] h-[80px] bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 
            onClick={() => navigate("/home")}
            className="text-5xl sm:text-7xl font-sans font-black tracking-tighter leading-none text-white cursor-pointer select-none"
          >
            PHYLAX<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 animate-pulse">.</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-semibold text-gray-500 mt-1.5 font-mono select-none">
            The Immutable Guardian for AI Agents
          </p>
        </div>

        {/* Dynamic Route changing links */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] font-bold uppercase tracking-widest font-mono relative z-10">
          <button
            onClick={() => navigate("/home")}
            className={`cursor-pointer transition-all pb-1 hover:text-white ${
              currentPath === "/" || currentPath === "/home" || currentPath === ""
                ? "text-cyan-400 border-b-2 border-cyan-400" 
                : "text-gray-500 opacity-60 hover:opacity-100"
            }`}
          >
            01 Home
          </button>
          
          <button
            onClick={() => navigate("/dashboard")}
            className={`cursor-pointer transition-all pb-1 hover:text-white ${
              currentPath === "/dashboard" || currentPath === "/dashborad"
                ? "text-fuchsia-400 border-b-2 border-fuchsia-500" 
                : "text-gray-500 opacity-60 hover:opacity-100"
            }`}
          >
            02 Control Panel
          </button>
          
          <button
            onClick={() => navigate("/doc")}
            className={`cursor-pointer transition-all pb-1 hover:text-white ${
              currentPath === "/doc" || currentPath === "/docs"
                ? "text-purple-400 border-b-2 border-purple-500" 
                : "text-gray-500 opacity-60 hover:opacity-100"
            }`}
          >
            03 Documentation
          </button>
          
          <span className="opacity-30 border-l border-slate-800 pl-4 hidden md:inline text-gray-650">
            Arbitrum Sepolia Testnet
          </span>
        </div>
      </header>

      {/* PATH RESOLVER WORKSPACE */}
      <main className="flex-1 bg-[#050505] p-4 sm:p-8">
        {(currentPath === "/" || currentPath === "/home" || currentPath === "") && (
          <LandingPage 
            onNavigateToDashboard={() => navigate("/dashboard")}
            onNavigateToDocs={() => navigate("/doc")}
          />
        )}
        
        {(currentPath === "/dashboard" || currentPath === "/dashborad") && (
          <ControlPanel />
        )}
        
        {(currentPath === "/doc" || currentPath === "/docs") && (
          <DocsPage />
        )}
      </main>

      {/* Sub-border Footer info */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-[10px] font-mono text-gray-650 uppercase tracking-wider bg-black/40">
        <span>PHYLAX SECURITY STANDARDS v1.0.4 • DECENTRALIZED POLICIES</span>
      </footer>

    </div>
  );
}
