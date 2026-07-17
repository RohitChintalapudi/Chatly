import { MessageSquare, Users, Zap, ImageIcon, Bell, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    desc: "Send and receive messages instantly with live updates.",
    status: "live",
  },
  {
    icon: ImageIcon,
    title: "Image Sharing",
    desc: "Share photos and images directly in your conversations.",
    status: "live",
  },
  {
    icon: Users,
    title: "Online Presence",
    desc: "See who's online right now with live status indicators.",
    status: "live",
  },
  {
    icon: Zap,
    title: "Voice Messages",
    desc: "Record and send voice notes to express yourself.",
    status: "coming",
  },
  {
    icon: Bell,
    title: "Push Notifications",
    desc: "Get notified of new messages even when you're away.",
    status: "coming",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    desc: "Smart replies and conversation summaries powered by AI.",
    status: "coming",
  },
];

const ChatDashboard = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 md:p-12 bg-[var(--surface-muted)] overflow-y-auto transition-colors">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-[var(--accent)] opacity-20 rounded-2xl animate-glow-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--line)] transition-colors">
              <MessageSquare className="w-10 h-10 text-[var(--primary-text)]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-[var(--primary-text)]">
          Welcome to Chatly!
        </h2>
        <p className="text-[var(--secondary-text)] font-medium max-w-md mx-auto">
          Select a contact from the sidebar to start a conversation, or explore what Chatly has to offer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative p-4 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-4 h-4 text-[var(--primary-text)]" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[var(--primary-text)]">
                        {f.title}
                      </span>
                      {f.status === "live" ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-600 border border-green-500/30">
                          LIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                          SOON
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--secondary-text)] font-medium mt-0.5 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
