import React, { useEffect } from "react";
import { useGamesStore } from "../../store/useGamesStore";
import { GamesSection } from "./GamesSection";
import { motion, AnimatePresence } from "framer-motion";

export const MiniGamesModal = () => {
  const { isGamesModalOpen, closeGames, activeGame, setActiveGame } = useGamesStore();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isGamesModalOpen) {
        if (activeGame) {
          setActiveGame(null);
        } else {
          closeGames();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGamesModalOpen, activeGame, closeGames, setActiveGame]);

  if (!isGamesModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop Dismiss Wrapper */}
        <div
          className="absolute inset-0 cursor-default"
          onClick={() => {
            if (!activeGame) {
              closeGames();
            }
          }}
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative bg-[var(--surface)] border-2 sm:border-3 border-[var(--line)] rounded-3xl w-full max-w-4xl h-[92vh] sm:h-[88vh] overflow-hidden shadow-[8px_8px_0px_0px_var(--line)] z-10 flex flex-col"
        >
          <GamesSection onClose={closeGames} showClose={true} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
