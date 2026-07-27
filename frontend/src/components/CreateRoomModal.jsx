import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Radio, Copy, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const CreateRoomModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { socket, authUser } = useAuthStore();

  if (!isOpen) return null;

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const roomTitle = title.trim() || "Live Audio Lounge";
    const roomId = `audio-room-${Math.floor(1000 + Math.random() * 9000)}`;

    if (socket) {
      socket.emit("create-room", {
        title: roomTitle,
        roomId,
        user: authUser || { name: "Host" },
      });
    }

    setCreatedRoomId(roomId);
  };

  const roomLink = createdRoomId
    ? `${window.location.origin}/room/${createdRoomId}`
    : "";

  const copyLink = () => {
    if (!roomLink) return;
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    toast.success("Room invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinNow = () => {
    if (!createdRoomId) return;
    onClose();
    navigate(`/room/${createdRoomId}`);
  };

  const resetModal = () => {
    setTitle("");
    setCreatedRoomId(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl w-full max-w-md p-6 shadow-[6px_6px_0px_0px_var(--line)] relative">
        <button
          onClick={resetModal}
          className="absolute top-4 right-4 text-[var(--secondary-text)] hover:text-[var(--primary-text)] cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center">
            <Radio className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--primary-text)]">
              Create Live Audio Room
            </h3>
            <p className="text-xs text-[var(--secondary-text)] font-semibold">
              Drop-in audio channel with instant WebRTC signaling
            </p>
          </div>
        </div>

        {!createdRoomId ? (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--primary-text)] mb-1.5">
                Room Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design Sync & Chill Lounge"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-medium focus:outline-none focus:border-[var(--accent)] text-sm"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold flex items-center justify-center gap-2 hover:bg-[var(--accent-hover)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Sparkles size={18} />
              <span>Create Audio Room</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-xl">
              <span className="text-[11px] font-bold text-[var(--secondary-text)] uppercase tracking-wider block mb-1">
                Shareable Room Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={roomLink}
                  className="flex-1 bg-transparent text-xs font-mono font-bold text-[var(--primary-text)] truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-3 py-1.5 rounded-lg border-2 border-[var(--line)] bg-[var(--surface)] text-xs font-extrabold flex items-center gap-1 hover:bg-[var(--accent)]/10 cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-extrabold text-sm hover:bg-[var(--accent)]/10 transition-all cursor-pointer"
              >
                Copy Link
              </button>
              <button
                type="button"
                onClick={handleJoinNow}
                className="flex-1 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-sm hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] transition-all cursor-pointer"
              >
                Enter Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoomModal;
