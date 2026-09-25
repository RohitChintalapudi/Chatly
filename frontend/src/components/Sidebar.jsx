import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus, Copy, Check, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts, subscribeToMessages, unsubscribeFromMessages, addContact, isAddingContact } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [contactCode, setContactCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    getUsers();
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [getUsers, subscribeToMessages, unsubscribeFromMessages]);

  const handleCopyCode = () => {
    if (!authUser?.chatCode) return;
    navigator.clipboard.writeText(authUser.chatCode);
    setCopiedCode(true);
    toast.success("Your 6-digit code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    const cleanCode = contactCode.trim();
    if (!cleanCode) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    if (!/^\d{6}$/.test(cleanCode)) {
      toast.error("Code must be exactly 6 digits");
      return;
    }
    if (cleanCode === authUser?.chatCode) {
      toast.error("You cannot add your own code");
      return;
    }

    const success = await addContact(cleanCode);
    if (success) {
      setContactCode("");
    }
  };

  const filteredUsers = Array.isArray(users)
    ? showOnlineOnly
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users
    : [];

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className={`h-full ${selectedUser ? "hidden lg:flex" : "flex"} w-full lg:w-80 lg:border-r-2 border-[var(--line)] bg-[var(--surface)] flex-col transition-all duration-200`}>
      {/* Header & User Code Card */}
      <div className="border-b-2 border-[var(--line)] w-full p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center transition-colors shadow-[2px_2px_0px_0px_var(--line)]">
              <Users className="w-4 h-4 text-[var(--primary-text)]" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-[var(--primary-text)] text-sm">Direct Contacts</span>
          </div>
          <span className="text-xs font-extrabold text-[var(--secondary-text)] bg-[var(--surface-muted)] px-2 py-0.5 rounded-md border border-[var(--line)]">
            {users.length} Saved
          </span>
        </div>

        {/* My Unique 6-Digit Chat Code */}
        {authUser?.chatCode && (
          <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-xl p-2.5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--secondary-text)] uppercase tracking-wider">
                My Chat Code
              </span>
              <span className="font-mono font-black text-sm tracking-widest text-[var(--primary-text)]">
                {authUser.chatCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--accent)] text-[var(--primary-text)] font-extrabold text-xs rounded-lg border-2 border-[var(--line)] hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer"
              title="Copy your chat code"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}

        {/* Add Contact by Code Form */}
        <form onSubmit={handleAddContact} className="space-y-1.5">
          <label className="text-[11px] font-bold text-[var(--secondary-text)] flex items-center gap-1">
            <UserPlus className="w-3 h-3 text-[var(--accent)]" /> Add Friend by 6-Digit Code
          </label>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={contactCode}
                onChange={(e) => setContactCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-1.5 bg-[var(--surface)] rounded-xl border-2 border-[var(--line)] text-[var(--primary-text)] font-mono font-bold text-xs tracking-wider placeholder:text-[var(--secondary-text)]/60 placeholder:font-sans focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingContact || contactCode.trim().length !== 6}
              className="px-3 py-1.5 bg-[var(--accent)] text-[var(--primary-text)] font-extrabold text-xs rounded-xl border-2 border-[var(--line)] hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 cursor-pointer flex items-center gap-1 shrink-0"
            >
              {isAddingContact ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Online only filter */}
        <div className="flex items-center justify-between pt-1">
          <label className="cursor-pointer flex items-center gap-2">
            <div className="relative">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="peer sr-only cursor-pointer"
              />
              <div className="w-4 h-4 rounded border-2 border-[var(--line)] bg-[var(--surface)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--line)] transition-colors" />
              <svg className="absolute top-0 left-0 w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3 3 7-7" stroke="var(--primary-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-[var(--primary-text)]">Online only</span>
          </label>
          <span className="text-[11px] text-[var(--secondary-text)] font-medium">
            ({filteredUsers.filter((u) => onlineUsers.includes(u._id)).length} online)
          </span>
        </div>
      </div>

      {/* Contacts List */}
      <div className="overflow-y-auto w-full py-2 flex-1">
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
            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-11 object-cover rounded-full border-2 border-white shadow-sm"
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
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[var(--primary-text)] truncate text-sm">{user.fullName}</div>
                {user.chatCode && (
                  <span className="text-[10px] font-mono text-[var(--secondary-text)] bg-[var(--surface-muted)] px-1 rounded border border-[var(--line)]/30">
                    #{user.chatCode}
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--secondary-text)] font-semibold flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${onlineUsers.includes(user._id) ? "bg-green-500" : "bg-gray-400"}`} />
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 px-4 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 border-2 border-[var(--line)] flex items-center justify-center mx-auto text-[var(--primary-text)]">
              <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h4 className="text-xs font-extrabold text-[var(--primary-text)]">
              {showOnlineOnly ? "No contacts online" : "No saved contacts yet"}
            </h4>
            <p className="text-[11px] text-[var(--secondary-text)] font-medium max-w-[200px] mx-auto leading-relaxed">
              {showOnlineOnly
                ? "None of your added contacts are currently active."
                : "Enter a friend's 6-digit code above or share your code to start private chats."}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
