import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [getUsers, subscribeToMessages, unsubscribeFromMessages]);

  const filteredUsers = Array.isArray(users)
    ? showOnlineOnly
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users
    : [];

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r-2 border-[var(--line)] bg-[var(--surface)] flex flex-col transition-all duration-200">
      <div className="border-b-2 border-[var(--line)] w-full p-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center transition-colors">
            <Users className="w-4 h-4 text-[var(--primary-text)]" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold hidden lg:block text-[var(--primary-text)]">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
            />
            <span className="text-sm font-semibold text-[var(--primary-text)]">Show online only</span>
          </label>
          <span className="text-xs text-[var(--secondary-text)] font-medium">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 transition-all duration-200 cursor-pointer hover:bg-[var(--accent)]/10 ${
              selectedUser?._id === user._id
                ? "bg-[var(--accent)]/15 border-r-4 border-r-[var(--accent)]"
                : unreadCounts[user._id] > 0
                  ? "bg-[var(--accent)]/5"
                  : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full border-2 border-white shadow-sm"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-[var(--surface)]" />
              )}
              {unreadCounts[user._id] > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-extrabold border-2 border-[var(--surface)] animate-bounce">
                  {unreadCounts[user._id] > 99 ? "99+" : unreadCounts[user._id]}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-bold text-[var(--primary-text)] truncate">{user.fullName}</div>
              <div className="text-sm text-[var(--secondary-text)] font-medium">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center text-[var(--secondary-text)] py-4 font-semibold text-sm">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
