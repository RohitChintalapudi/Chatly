import { MessageSquare, Copy, Check } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import toast from "react-hot-toast";

const NoChatSelected = () => {
  const { authUser } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!authUser?.chatCode) return;
    navigator.clipboard.writeText(authUser.chatCode);
    setCopied(true);
    toast.success("Chat code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-[var(--surface-muted)] transition-colors">
      <div className="max-w-md text-center space-y-5">
        <div className="flex justify-center gap-4 mb-2">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-[var(--accent)] opacity-20 rounded-2xl animate-glow-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center animate-bounce shadow-[4px_4px_0px_0px_var(--line)] transition-colors">
              <MessageSquare className="w-10 h-10 text-[var(--primary-text)]" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-[var(--primary-text)]">Private Direct Messaging</h2>
        <p className="text-[var(--secondary-text)] font-medium text-sm">
          Chat securely 1-on-1 without stranger interference. Select a saved contact or connect with a friend using their 6-digit code.
        </p>

        {authUser?.chatCode && (
          <div className="inline-flex items-center gap-2 bg-[var(--surface)] border-2 border-[var(--line)] px-4 py-2 rounded-2xl shadow-[3px_3px_0px_0px_var(--line)]">
            <span className="text-xs font-bold text-[var(--secondary-text)]">Your Code:</span>
            <span className="font-mono font-black text-base tracking-widest text-[var(--primary-text)]">
              {authUser.chatCode}
            </span>
            <button
              onClick={handleCopy}
              className="ml-1 p-1.5 rounded-lg border border-[var(--line)] bg-[var(--accent)] text-[var(--primary-text)] hover:shadow-sm transition-all cursor-pointer"
              title="Copy your 6-digit code"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <div className="flex justify-center gap-1.5 pt-2">
          <span className="w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--line)] animate-bounce" style={{ animationDelay: "0s" }} />
          <span className="w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--line)] animate-bounce" style={{ animationDelay: "0.15s" }} />
          <span className="w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--line)] animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
