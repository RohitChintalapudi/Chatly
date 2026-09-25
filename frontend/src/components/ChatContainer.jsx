import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import AudioMessageBubble from "./AudioMessageBubble";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { formatMessageTime } from "../lib/utils";
import { Trash2, MessageSquare } from "lucide-react";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, deleteMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const { chatFontWeight } = useThemeStore();
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col bg-[var(--surface)]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex-1 flex flex-col bg-[var(--surface)]">
      <ChatHeader />
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 chat-scroll" style={{ willChange: "scroll-position" }}>
        {safeMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--secondary-text)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 border-2 border-[var(--line)] flex items-center justify-center text-[var(--primary-text)]">
              <MessageSquare className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-[var(--primary-text)]">No messages yet</h4>
              <p className="text-xs max-w-[220px]">
                Say hello to <span className="font-bold text-[var(--primary-text)]">{selectedUser.fullName}</span> to start this private chat!
              </p>
            </div>
          </div>
        ) : (
          safeMessages.map((message) => {
            const isSender = message.senderId === authUser._id;
            return (
              <div key={message._id} className={`flex group ${isSender ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${isSender ? "flex-row-reverse" : ""}`}>
                  <img
                    src={isSender ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
                    alt="profile pic"
                    className="size-7 sm:size-8 rounded-full border-2 border-white object-cover flex-shrink-0 mt-1 shadow-sm"
                  />
                  <div className="group/bubble relative">
                    <div className={`flex items-center gap-1.5 mb-1 px-1 ${isSender ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-[var(--secondary-text)] font-semibold">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {/* Delete Individual Message Button */}
                      <button
                        type="button"
                        onClick={() => deleteMessage(message._id)}
                        className="opacity-0 group-hover/bubble:opacity-100 p-0.5 text-[var(--secondary-text)] hover:text-red-500 rounded transition-all cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className={`rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 border-2 border-[var(--line)] text-sm transition-colors ${
                      isSender
                        ? "bg-[var(--accent)] text-black rounded-br-md"
                        : "bg-[var(--surface-muted)] text-[var(--primary-text)] rounded-bl-md"
                    }`} style={{ fontWeight: chatFontWeight }}>
                      {message.image && (
                        <img src={message.image} alt="Attachment" className="max-w-[200px] sm:max-w-[200px] rounded-lg mb-2 border border-[var(--line)]/20" />
                      )}
                      {message.audio && (
                        <AudioMessageBubble
                          audioUrl={message.audio}
                          isSender={isSender}
                        />
                      )}
                      {message.text && <p className={message.audio || message.image ? "mt-2" : ""}>{message.text}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput />
    </div>
  );
};
export default ChatContainer;
