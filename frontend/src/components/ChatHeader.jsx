import { useState, useRef, useEffect } from "react";
import { X, ArrowLeft, MoreVertical, Trash2, UserMinus, AlertTriangle, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearChat, removeContact, isClearingChat, isRemovingContact } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [deleteHistoryOnRemove, setDeleteHistoryOnRemove] = useState(true);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleClearChat = async () => {
    if (!selectedUser?._id) return;
    const success = await clearChat(selectedUser._id);
    if (success) {
      setShowClearModal(false);
      setShowMenu(false);
    }
  };

  const handleRemoveContact = async () => {
    if (!selectedUser?._id) return;
    const success = await removeContact(selectedUser._id, deleteHistoryOnRemove);
    if (success) {
      setShowRemoveModal(false);
      setShowMenu(false);
    }
  };

  return (
    <>
      <div className="p-3 border-b-2 border-[var(--line)] bg-[var(--surface)] transition-colors relative">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="size-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
              {onlineUsers.includes(selectedUser._id) && (
                <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-[var(--surface)]" />
              )}
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-[var(--primary-text)] text-sm truncate">{selectedUser.fullName}</h3>
                {selectedUser.chatCode && (
                  <span className="text-[10px] font-mono text-[var(--secondary-text)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded border border-[var(--line)]/30 shrink-0">
                    #{selectedUser.chatCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--secondary-text)] font-semibold truncate">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Options Dropdown Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg border-2 border-[var(--line)] bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--surface-muted)] transition-all cursor-pointer flex-shrink-0 ${
                  showMenu ? "bg-[var(--surface-muted)] ring-2 ring-[var(--accent)]" : ""
                }`}
                title="Chat & Contact options"
              >
                <MoreVertical className="w-4 h-4 text-[var(--primary-text)]" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface)] rounded-xl border-2 border-[var(--line)] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-[var(--line)]/30 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--secondary-text)]">
                      Chat Options
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowClearModal(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-[var(--primary-text)] hover:bg-amber-500/10 hover:text-amber-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Clear Chat History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowRemoveModal(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <UserMinus className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Remove from Saved List</span>
                  </button>
                </div>
              )}
            </div>

            {/* Back / Close button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border-2 border-[var(--line)] bg-[var(--surface)] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 transition-all cursor-pointer flex-shrink-0"
              title="Close chat"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--primary-text)] lg:hidden" />
              <X className="w-4 h-4 text-[var(--primary-text)] hidden lg:block" />
            </button>
          </div>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[var(--primary-text)]">Clear Chat History?</h3>
                <p className="text-xs text-[var(--secondary-text)]">With {selectedUser.fullName}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--secondary-text)] leading-relaxed bg-[var(--surface-muted)] p-3 rounded-xl border border-[var(--line)]/30">
              This will permanently delete all text messages, photos, and voice notes exchanged in this conversation.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={isClearingChat}
                className="px-4 py-2 rounded-xl border-2 border-[var(--line)] font-bold text-xs text-[var(--primary-text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                disabled={isClearingChat}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs border-2 border-amber-600 hover:shadow-[2px_2px_0px_0px_var(--line)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isClearingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Clear All Messages</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Contact Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border-2 border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[var(--primary-text)]">Remove from Saved List?</h3>
                <p className="text-xs text-[var(--secondary-text)]">{selectedUser.fullName}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--secondary-text)] leading-relaxed">
              This contact will be removed from your sidebar and saved list. You can add them again at any time using their 6-digit code.
            </p>

            <label className="flex items-center gap-2.5 p-2.5 bg-[var(--surface-muted)] rounded-xl border border-[var(--line)]/30 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deleteHistoryOnRemove}
                onChange={(e) => setDeleteHistoryOnRemove(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-[var(--line)] text-red-500 focus:ring-red-400"
              />
              <span className="text-xs font-bold text-[var(--primary-text)]">
                Also delete all message history
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRemoveModal(false)}
                disabled={isRemovingContact}
                className="px-4 py-2 rounded-xl border-2 border-[var(--line)] font-bold text-xs text-[var(--primary-text)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveContact}
                disabled={isRemovingContact}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs border-2 border-red-600 hover:shadow-[2px_2px_0px_0px_var(--line)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRemovingContact ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                <span>Remove Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default ChatHeader;

