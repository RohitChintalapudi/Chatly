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
    stats: "Zero server storage · 0 limits",
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
    <div className="w-full hidden lg:flex flex-1 flex-col items-center justify-center p-4 xl:p-6 bg-[var(--surface-muted)] overflow-hidden transition-colors h-full">
      <div className="max-w-xl w-full flex flex-col justify-center space-y-3.5 xl:space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-lg bg-[var(--accent)] opacity-25 rounded-2xl animate-glow-pulse" />
              <div className="relative size-12 sm:size-14 rounded-2xl bg-[var(--surface)] border-2 border-[var(--line)] flex items-center justify-center p-2 shadow-[3px_3px_0px_0px_var(--line)] transition-colors">
                <img
                  src="/chatly-logo.png"
                  alt="Chatly Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)] tracking-tight">
              Welcome to Chatly!
            </h2>
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--primary-text)] bg-[var(--accent)]/20 border-2 border-[var(--line)] px-2.5 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_0px_var(--line)]">
              <Sparkles className="size-3 text-[var(--primary-text)]" />
              <span>More Than A Chatting App</span>
            </div>
          </div>

          <p className="text-[var(--secondary-text)] font-medium max-w-sm mx-auto text-xs leading-relaxed">
            Select a contact to start chatting, or launch workspace modules below.
          </p>
        </div>

        {/* Repositories & Modules Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-[var(--accent)]" />
              <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--primary-text)] font-mono">
                Workspace Repositories & Modules
              </h3>
              <span className="px-1.5 py-0.2 rounded-md bg-[var(--surface)] text-[10px] font-bold border border-[var(--line)] shadow-[1px_1px_0px_0px_var(--line)]">
                {repositories.length}
              </span>
            </div>

            {repositories.length < INITIAL_REPOSITORIES.length && (
              <button
                type="button"
                onClick={handleResetRepositories}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--secondary-text)] hover:text-[var(--primary-text)] transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Swipeable List */}
          <div className="space-y-2">
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
                      "p-2.5 sm:p-3 flex items-center justify-between gap-3 group transition-all duration-150",
                      (repo.isGame || repo.path) ? "cursor-pointer" : "cursor-grab"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Icon Container */}
                      <div className="size-8 sm:size-9 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_var(--line)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_0px_var(--line)] transition-all">
                        <Icon className="size-4 text-[var(--primary-text)]" strokeWidth={2.5} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs sm:text-sm text-[var(--primary-text)] truncate font-mono">
                            {repo.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[var(--surface-muted)] text-[var(--primary-text)] border border-[var(--line)]/40">
                            {repo.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--secondary-text)] font-medium truncate mt-0.5 max-w-xs sm:max-w-md">
                          {repo.desc}
                        </p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-[10px] font-mono font-bold text-[var(--secondary-text)]">
                          {repo.stats}
                        </span>
                        <span className="text-[9px] text-[var(--secondary-text)]/70">
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
                        className="p-1 rounded-lg text-[var(--secondary-text)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
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
                className="flex flex-col items-center justify-center py-6 px-4 text-center rounded-2xl border-2 border-dashed border-[var(--line)]/40 bg-[var(--surface)]/50 space-y-2.5"
              >
                <div className="size-9 rounded-full bg-[var(--accent)]/20 border border-[var(--line)] flex items-center justify-center">
                  <GitBranch className="size-4 text-[var(--primary-text)]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[var(--primary-text)]">
                    All workspace repositories cleared
                  </h4>
                  <p className="text-[11px] text-[var(--secondary-text)] mt-0.5">
                    Restore the default repositories anytime to continue working.
                  </p>
                </div>
                <Button
                  onClick={handleResetRepositories}
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3" />
                  <span>Restore Repositories</span>
                </Button>
              </motion.div>
            )}
          </div>

          <p className="text-[10px] font-mono text-center text-[var(--secondary-text)]/70 pt-0.5">
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
              className="relative w-full max-w-sm bg-[var(--surface)] text-[var(--primary-text)] border-2 border-[var(--line)] rounded-3xl p-5 shadow-[6px_6px_0px_0px_var(--line)] flex flex-col items-center text-center space-y-3.5 select-none"
            >
              {/* Alert Icon */}
              <div className="size-11 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-500 flex items-center justify-center shadow-[2px_2px_0px_0px_var(--line)]">
                <AlertTriangle className="size-5 stroke-[2.5]" />
              </div>

              {/* Text */}
              <div className="space-y-1">
                <h3 className="text-base font-black text-[var(--primary-text)]">
                  Delete Repository?
                </h3>
                <p className="text-xs text-[var(--secondary-text)] font-medium leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-mono font-bold text-[var(--primary-text)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded border border-[var(--line)]/20">
                    {pendingDelete.name}
                  </span>{" "}
                  from your dashboard workspace?
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2.5 w-full pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPendingDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1"
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
