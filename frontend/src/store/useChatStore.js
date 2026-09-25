import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isAddingContact: false,
  unreadCounts: {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load contacts";
      toast.error(msg);
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  addContact: async (code) => {
    set({ isAddingContact: true });
    try {
      const res = await axiosInstance.post("/messages/add-contact", { code });
      const newContact = res.data.contact;
      const currentUsers = get().users || [];
      const exists = currentUsers.some((u) => u._id === newContact._id);
      if (!exists) {
        set({ users: [newContact, ...currentUsers] });
      }
      set({ selectedUser: newContact });
      toast.success(res.data.message || "Contact added successfully!");
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to add contact";
      toast.error(msg);
      return false;
    } finally {
      set({ isAddingContact: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load messages";
      toast.error(msg);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...(messages || []), res.data] });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send message";
      toast.error(msg);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("newContactAdded");

    socket.on("newMessage", async (newMessage) => {
      const { selectedUser, unreadCounts, users } = get();
      const isFromSelected = selectedUser && newMessage.senderId === selectedUser._id;

      if (isFromSelected) {
        set({ messages: [...(get().messages || []), newMessage] });
      } else {
        const senderId = newMessage.senderId;
        const current = unreadCounts[senderId] || 0;
        set({
          unreadCounts: { ...unreadCounts, [senderId]: current + 1 },
        });

        // Ensure the sender is in the contacts list in real time
        const senderExists = (users || []).some((u) => u._id === senderId);
        if (!senderExists) {
          if (newMessage.sender) {
            set({ users: [newMessage.sender, ...get().users] });
          } else {
            await get().getUsers();
          }
        }

        // Show friendly notification toast
        const senderUser = (get().users || []).find((u) => u._id === senderId) || newMessage.sender;
        const senderName = senderUser?.fullName || "Contact";
        const preview = newMessage.text
          ? newMessage.text
          : newMessage.image
            ? "Sent an image"
            : newMessage.audio
              ? "Sent a voice message"
              : "Sent you a message";

        toast(`${senderName}: ${preview}`, {
          icon: "💬",
          id: `msg-${newMessage._id || Date.now()}`,
          duration: 4000,
        });
      }
    });

    socket.on("newContactAdded", (data) => {
      if (data?.user) {
        const { users } = get();
        const exists = (users || []).some((u) => u._id === data.user._id);
        if (!exists) {
          set({ users: [data.user, ...users] });
        }
        toast.success(`${data.user.fullName} connected with you!`);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("newContactAdded");
    }
  },

  setSelectedUser: (selectedUser) => {
    if (selectedUser) {
      const { unreadCounts } = get();
      const updated = { ...unreadCounts };
      delete updated[selectedUser._id];
      set({ selectedUser, unreadCounts: updated });
    } else {
      set({ selectedUser });
    }
  },
}));
