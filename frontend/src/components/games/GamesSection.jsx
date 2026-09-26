import React from "react";
import { useGamesStore } from "../../store/useGamesStore";
import { GameSelector } from "./GameSelector";
import { FlappyBird } from "./FlappyBird";
import { Snake } from "./Snake";

export const GamesSection = ({ onClose, showClose = false }) => {
  const { activeGame, setActiveGame } = useGamesStore();

  const handleBackToMenu = () => {
    setActiveGame(null);
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col bg-[var(--surface)] text-[var(--primary-text)] relative overflow-hidden">
      {activeGame === null && (
        <div className="w-full h-full flex-1 overflow-y-auto">
          <GameSelector onClose={onClose} showClose={showClose} />
        </div>
      )}
      {activeGame === "flappy" && (
        <FlappyBird onBack={handleBackToMenu} />
      )}
      {activeGame === "snake" && (
        <Snake onBack={handleBackToMenu} />
      )}
    </div>
  );
};
