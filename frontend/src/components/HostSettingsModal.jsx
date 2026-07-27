import { useState } from "react";
import { X, Settings, ShieldAlert, Lock, Unlock, MicOff, AlertTriangle, Edit3, Save } from "lucide-react";
import toast from "react-hot-toast";

const HostSettingsModal = ({
  isOpen,
  onClose,
  currentTitle,
  isLocked,
  onRenameRoom,
  onToggleLock,
  onMuteAllPeers,
  onEndRoom,
}) => {
  const [newTitle, setNewTitle] = useState(currentTitle || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  if (!isOpen) return null;

  const handleSaveTitle = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onRenameRoom(newTitle.trim());
    setIsEditingTitle(false);
    toast.success("Room title updated!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl w-full max-w-md p-6 shadow-[6px_6px_0px_0px_var(--line)] relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--secondary-text)] hover:text-[var(--primary-text)] cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center text-black font-black">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--primary-text)]">
              Room Host Controls
            </h3>
            <p className="text-xs font-semibold text-[var(--secondary-text)]">
              Creator settings & channel management
            </p>
          </div>
        </div>

        {/* Edit Room Title Section */}
        <div className="p-3 bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-xl space-y-2">
          <span className="text-xs font-extrabold text-[var(--secondary-text)] uppercase tracking-wider block">
            Room Title
          </span>
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border-2 border-[var(--line)] bg-[var(--surface)] text-sm font-bold text-[var(--primary-text)] focus:outline-none focus:border-[var(--accent)]"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[var(--accent)] text-black rounded-lg border-2 border-[var(--line)] font-bold text-xs flex items-center gap-1 hover:bg-[var(--accent-hover)] cursor-pointer"
              >
                <Save size={14} />
                <span>Save</span>
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-[var(--primary-text)] truncate">
                {currentTitle}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="px-2.5 py-1 rounded-lg border-2 border-[var(--line)] bg-[var(--surface)] text-xs font-extrabold flex items-center gap-1 hover:bg-[var(--accent)]/10 cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            </div>
          )}
        </div>

        {/* Host Control Actions */}
        <div className="space-y-3 pt-1">
          {/* Lock / Unlock Room Toggle */}
          <div className="flex items-center justify-between p-3 bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[var(--surface)] border-2 border-[var(--line)] text-[var(--primary-text)]">
                {isLocked ? <Lock size={18} className="text-red-500" /> : <Unlock size={18} />}
              </div>
              <div>
                <div className="text-xs font-black text-[var(--primary-text)]">
                  {isLocked ? "Room is Locked" : "Room is Open"}
                </div>
                <div className="text-[11px] font-semibold text-[var(--secondary-text)]">
                  {isLocked ? "New participants cannot join" : "Anyone with link can join"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleLock(!isLocked)}
              className={`px-3 py-1.5 rounded-xl border-2 border-[var(--line)] text-xs font-black transition-all cursor-pointer ${
                isLocked
                  ? "bg-red-500 text-white border-red-600 hover:bg-red-600"
                  : "bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]"
              }`}
            >
              {isLocked ? "Unlock Room" : "Lock Room"}
            </button>
          </div>

          {/* Mute All Peers */}
          <button
            type="button"
            onClick={() => {
              onMuteAllPeers();
              toast.success("Muted all participants in room!");
            }}
            className="w-full p-3 bg-[var(--surface-muted)] hover:bg-[var(--accent)]/10 border-2 border-[var(--line)] rounded-xl font-extrabold text-xs text-[var(--primary-text)] flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[var(--surface)] border-2 border-[var(--line)] text-red-500">
                <MicOff size={18} />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-[var(--primary-text)]">Mute All Participants</div>
                <div className="text-[11px] font-semibold text-[var(--secondary-text)]">Force mute everyone except host</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-[var(--surface)] border-2 border-[var(--line)] rounded-lg text-xs font-black">
              Mute All
            </span>
          </button>
        </div>

        {/* End Room Danger Action */}
        <div className="pt-2 border-t-2 border-[var(--line)]">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to end this audio room for everyone?")) {
                onEndRoom();
              }
            }}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border-2 border-red-500 text-red-500 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <AlertTriangle size={16} />
            <span>End Room Session for Everyone</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostSettingsModal;
