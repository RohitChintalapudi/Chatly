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
    <div className="w-full h-full flex flex-col bg-[var(--surface)] text-[var(--primary-text)] overflow-y-auto">
      {activeGame === null && (
        <GameSelector onClose={onClose} showClose={showClose} />
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
