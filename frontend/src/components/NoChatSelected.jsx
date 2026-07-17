import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-[var(--surface-muted)] transition-colors">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-[var(--accent)] opacity-20 rounded-2xl animate-glow-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center animate-bounce shadow-[4px_4px_0px_0px_var(--line)] transition-colors">
              <MessageSquare className="w-10 h-10 text-[var(--primary-text)]" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-[var(--primary-text)]">Welcome to Chatly!</h2>
        <p className="text-[var(--secondary-text)] font-medium">Select a conversation from the sidebar to start chatting</p>
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
