import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import AudioMessageBubble from "./AudioMessageBubble";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();
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

  return (
    <div className="flex-1 flex flex-col bg-[var(--surface)]">
      <ChatHeader />
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 chat-scroll" style={{ willChange: "scroll-position" }}>
        {(Array.isArray(messages) ? messages : []).map((message) => (
          <div key={message._id} className={`flex ${message.senderId === authUser._id ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${message.senderId === authUser._id ? "flex-row-reverse" : ""}`}>
              <img
                src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
                alt="profile pic"
                className="size-7 sm:size-8 rounded-full border-2 border-white object-cover flex-shrink-0 mt-1 shadow-sm"
              />
              <div>
                <div className="text-[10px] text-[var(--secondary-text)] font-semibold mb-1 px-1">
                  {formatMessageTime(message.createdAt)}
                </div>
                <div className={`rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 border-2 border-[var(--line)] text-sm transition-colors ${
                  message.senderId === authUser._id
                    ? "bg-[var(--accent)] text-black rounded-br-md"
                    : "bg-[var(--surface-muted)] text-[var(--primary-text)] rounded-bl-md"
                }`} style={{ fontWeight: chatFontWeight }}>
                  {message.image && (
                    <img src={message.image} alt="Attachment" className="max-w-[200px] sm:max-w-[200px] rounded-lg mb-2 border border-[var(--line)]/20" />
                  )}
                  {message.audio && (
                    <AudioMessageBubble
                      audioUrl={message.audio}
                      isSender={message.senderId === authUser._id}
                    />
                  )}
                  {message.text && <p className={message.audio || message.image ? "mt-2" : ""}>{message.text}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput />
    </div>
  );
};
export default ChatContainer;
