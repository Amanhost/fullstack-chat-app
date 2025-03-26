import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const userChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUsers: null,
  isUserLoading: false,
  isMessageLoading: false,
  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const resp = await axiosInstance.get("/messages/users");
      set({ users: resp.data });
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error into load users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const resp = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: resp.data });
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error into load message");
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUsers, messages } = get();
    try {
      const resp = await axiosInstance.post(
        `/messages/send/${selectedUsers._id}`,
        messageData
      );

      set({ messages: [...messages, resp.data] });
      get().moveUserToTop(selectedUsers._id);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error into send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUsers } = get();
    if (!selectedUsers) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUsers._id;

      if (isMessageSentFromSelectedUser) {
        set({ messages: [...get().messages, newMessage] });
      }

      get().moveUserToTop(newMessage.senderId);
    });
  },

  unscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: async (selectedUsers) => {
    try {
      set({ selectedUsers });
      get().moveUserToTop(selectedUsers._id);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error into load message");
    } finally {
      set({ isMessageLoading: false });
    }
  },

  moveUserToTop: (userId) => {
    const { users } = get();
    const updatedUsers = users.filter((user) => user._id !== userId);
    const movedUser = users.find((user) => user._id === userId);

    if (movedUser) {
      set({ users: [movedUser, ...updatedUsers] });
    }
  },
}));
