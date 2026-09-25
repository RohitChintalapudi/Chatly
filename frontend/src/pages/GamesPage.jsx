import React from "react";
import { GamesSection } from "../components/games/GamesSection";
import { MiniGamesModal } from "../components/games/MiniGamesModal";

const GamesPage = () => {
  return (
    <div className="min-h-screen bg-[var(--surface)] relative overflow-hidden transition-colors pt-20 pb-10 px-2 sm:px-4">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-[var(--accent)] rounded-full filter blur-3xl opacity-15 animate-float" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[var(--accent)] rounded-full filter blur-3xl opacity-10 animate-float-slow" />
        <div className="absolute top-[60%] left-[50%] w-64 h-64 bg-[var(--accent)] rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] shadow-[6px_6px_0px_0px_var(--line)] overflow-hidden min-h-[calc(100vh-8rem)] flex flex-col">
          <GamesSection />
        </div>
      </div>

      <MiniGamesModal />
    </div>
  );
};

export default GamesPage;
