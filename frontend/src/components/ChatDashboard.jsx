import React, { useState } from "react";
import {
  MessageSquare,
  Gamepad2,
  Share2,
  Radio,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  GitBranch,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamesStore } from "../store/useGamesStore";
import { useNavigate } from "react-router-dom";
import { SwipeToDelete } from "./spectrumui/swipe-to-delete";
import { Button } from "./motion";
import { cn } from "../lib/utils";
import toast from "react-hot-toast";

const INITIAL_REPOSITORIES = [
  {
    id: "repo-1",
    name: "chatly-core",
    category: "Real-time Messaging & Socket Mesh",
    desc: "Send and receive encrypted messages instantly with live sync.",
    icon: MessageSquare,
    tag: "Active",
    stats: "v2.4 · E2E Encrypted",
    time: "2m ago",
  },
  {
    id: "repo-2",
    name: "retro-arcade-hub",
    category: "Mini Games Engine",
    desc: "Play Flappy Bird and Snake directly inside Chatly with sound FX.",
    icon: Gamepad2,
    tag: "Playable",
    stats: "Arcade+ · High Scores",
    time: "15m ago",
    isGame: true,
  },
  {
    id: "repo-3",
    name: "webrtc-audio-mesh",
    category: "Live Audio Lounges",
    desc: "Create or join zero-latency peer audio rooms with instant mic controls.",
    icon: Radio,
    tag: "Live",
    stats: "P2P Mesh · 64kbps Opus",
    time: "1h ago",
    path: "/audio-rooms",
  },
  {
    id: "repo-4",
    name: "p2p-transfer-engine",
    category: "WebRTC File Sharing",
    desc: "Direct browser-to-browser chunked file transfer with zero limits.",
    icon: Share2,
    tag: "Secure",
    stats: "Zero storage · 0 limits",
    time: "3h ago",
    path: "/test-p2p",
  },
];

const ChatDashboard = () => {
  const [repositories, setRepositories] = useState(INITIAL_REPOSITORIES);
  const [pendingDelete, setPendingDelete] = useState(null);
  const openGames = useGamesStore((s) => s.openGames);
  const navigate = useNavigate();

  const handleInitiateDelete = (repo) => {
    setPendingDelete(repo);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    const removedItem = pendingDelete;
    setRepositories((prev) => prev.filter((r) => r.id !== removedItem.id));
    setPendingDelete(null);

    toast.success(`Removed "${removedItem.name}"`, {
      description: "Workspace item was removed from dashboard",
      action: {
        label: "Undo",
        onClick: () => {
          setRepositories((prev) => {
            if (prev.some((r) => r.id === removedItem.id)) return prev;
            return [removedItem, ...prev];
          });
          toast.success(`Restored "${removedItem.name}"`);
        },
      },
    });
  };

  const handleItemClick = (repo) => {
    if (repo.isGame) {
      openGames();
    } else if (repo.path) {
      navigate(repo.path);
    }
  };

  const handleResetRepositories = () => {
    setRepositories(INITIAL_REPOSITORIES);
    toast.success("All workspace repositories restored!");
  };

  return (
    <div className="w-full hidden lg:flex flex-1 flex-col items-center justify-center p-3 sm:p-4 md:p-5 bg-[var(--surface-muted)] overflow-hidden transition-colors h-full select-none">
      <div className="max-w-lg w-full flex flex-col justify-center space-y-2.5 sm:space-y-3 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-1 sm:space-y-1.5">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-md bg-[var(--accent)] opacity-20 rounded-xl animate-glow-pulse" />
              <div className="relative size-10 sm:size-11 rounded-xl bg-[var(--surface)] border-2 border-[var(--line)] flex items-center justify-center p-1.5 shadow-[2px_2px_0px_0px_var(--line)] transition-colors">
                <img
                  src="/chatly-logo.png"
                  alt="Chatly Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-[var(--primary-text)] tracking-tight">
              Welcome to Chatly!
            </h2>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[var(--primary-text)] bg-[var(--accent)]/20 border border-[var(--line)] px-2 py-0.5 rounded-full shadow-[1px_1px_0px_0px_var(--line)]">
              <Sparkles className="size-2.5 text-[var(--primary-text)]" />
              <span>More Than A Chatting App</span>
            </div>
          </div>

          <p className="text-[var(--secondary-text)] font-medium max-w-sm mx-auto text-[11px] leading-tight">
            Select a contact to start chatting, or launch workspace modules below.
          </p>
        </div>

        {/* Repositories & Modules Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Layers className="size-3 text-[var(--accent)]" />
              <h3 className="text-[10px] font-black uppercase tracking-wider text-[var(--primary-text)] font-mono">
                Workspace Repositories & Modules
              </h3>
              <span className="px-1.5 py-0.2 rounded bg-[var(--surface)] text-[9px] font-bold border border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)]">
                {repositories.length}
              </span>
            </div>

            {repositories.length < INITIAL_REPOSITORIES.length && (
              <button
                type="button"
                onClick={handleResetRepositories}
                className="inline-flex items-center gap-1 text-[9px] font-bold text-[var(--secondary-text)] hover:text-[var(--primary-text)] transition-colors cursor-pointer"
              >
                <RotateCcw className="size-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Swipeable List */}
          <div className="space-y-1.5">
            {repositories.map((repo) => {
              const Icon = repo.icon;
              return (
                <SwipeToDelete
                  key={repo.id}
                  label={`Repository ${repo.name}`}
                  onDelete={() => handleInitiateDelete(repo)}
                  className="shadow-none"
                >
                  <div
                    onClick={() => handleItemClick(repo)}
                    className={cn(
                      "py-2 px-3 flex items-center justify-between gap-2.5 group transition-all duration-150",
                      (repo.isGame || repo.path) ? "cursor-pointer" : "cursor-grab"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Icon Container */}
                      <div className="size-7 sm:size-8 rounded-lg bg-[var(--accent)] border border-[var(--line)] flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_var(--line)] group-hover:translate-x-[0.5px] group-hover:translate-y-[0.5px] group-hover:shadow-[1px_1px_0px_0px_var(--line)] transition-all">
                        <Icon className="size-3.5 sm:size-4 text-[var(--primary-text)]" strokeWidth={2.5} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[11px] sm:text-xs text-[var(--primary-text)] truncate font-mono">
                            {repo.name}
                          </span>
                          <span className="px-1 py-0.2 rounded text-[7.5px] font-black uppercase tracking-wider bg-[var(--surface-muted)] text-[var(--primary-text)] border border-[var(--line)]/40">
                            {repo.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--secondary-text)] font-medium truncate mt-0.5 max-w-[200px] sm:max-w-xs md:max-w-sm">
                          {repo.desc}
                        </p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-[9px] font-mono font-bold text-[var(--secondary-text)]">
                          {repo.stats}
                        </span>
                        <span className="text-[8px] text-[var(--secondary-text)]/70">
                          {repo.time}
                        </span>
                      </div>

                      {/* Delete Trigger Button (Accessible click alternative to swipe) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInitiateDelete(repo);
                        }}
                        aria-label={`Delete ${repo.name}`}
                        className="p-1 rounded-md text-[var(--secondary-text)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                </SwipeToDelete>
              );
            })}

            {/* Empty State when all deleted */}
            {repositories.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-5 px-3 text-center rounded-xl border-2 border-dashed border-[var(--line)]/40 bg-[var(--surface)]/50 space-y-2"
              >
                <div className="size-8 rounded-full bg-[var(--accent)]/20 border border-[var(--line)] flex items-center justify-center">
                  <GitBranch className="size-3.5 text-[var(--primary-text)]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[var(--primary-text)]">
                    All workspace repositories cleared
                  </h4>
                  <p className="text-[10px] text-[var(--secondary-text)] mt-0.5">
                    Restore default repositories anytime to continue.
                  </p>
                </div>
                <Button
                  onClick={handleResetRepositories}
                  variant="primary"
                  size="sm"
                  className="gap-1.5 py-1 px-3 text-xs"
                >
                  <RotateCcw className="size-2.5" />
                  <span>Restore Repositories</span>
                </Button>
              </motion.div>
            )}
          </div>

          <p className="text-[9px] font-mono text-center text-[var(--secondary-text)]/70 pt-0.5">
            👉 Drag row left to delete — with safety confirmation.
          </p>
        </div>
      </div>

      {/* Confirmation Modal to prevent accidental deletion */}
      <AnimatePresence>
        {pendingDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative w-full max-w-sm bg-[var(--surface)] text-[var(--primary-text)] border-2 border-[var(--line)] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_var(--line)] flex flex-col items-center text-center space-y-3 select-none"
            >
              {/* Alert Icon */}
              <div className="size-10 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-500 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_var(--line)]">
                <AlertTriangle className="size-4 stroke-[2.5]" />
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black text-[var(--primary-text)]">
                  Delete Repository?
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--secondary-text)] font-medium leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-mono font-bold text-[var(--primary-text)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded border border-[var(--line)]/20">
                    {pendingDelete.name}
                  </span>{" "}
                  from your dashboard workspace?
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 w-full pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs py-1.5"
                  onClick={() => setPendingDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1 text-xs py-1.5"
                  onClick={handleConfirmDelete}
                >
                  <Trash2 className="size-3" />
                  <span>Delete</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatDashboard;
