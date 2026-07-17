import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-3 border-b-2 border-[var(--line)] bg-[var(--surface)] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} className="size-10 rounded-full border-2 border-white object-cover shadow-sm" />
            {onlineUsers.includes(selectedUser._id) && (
              <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-[var(--surface)]" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-[var(--primary-text)] text-sm">{selectedUser.fullName}</h3>
            <p className="text-xs text-[var(--secondary-text)] font-semibold">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-lg border-2 border-[var(--line)] bg-[var(--surface)] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 transition-all cursor-pointer">
          <X className="w-4 h-4 text-[var(--primary-text)]" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
