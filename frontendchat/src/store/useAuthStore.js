import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLogginIng: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const resp = await axiosInstance.get("/auth/check");

      set({ authUser: resp.data });
      //socket.io is Added
      get().connectSocket();
    } catch (error) {
      console.log("auth error", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signUp: async (data) => {
    try {
      set({ isSigningUp: true });
      const resp = await axiosInstance.post("/auth/signup", data);
      set({ authUser: resp.data });
      toast.success("Account is created Successfully");
      //socket.io is Added
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("signup error");
    } finally {
      set({ isSigningUp: false });
    }
  },
  logOut: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      //socket.io disconnection is Added
      get().disconnectSocket();
      toast.success("Logged out Successfully");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("signup error");
    }
  },
  login: async (data) => {
    set({ isSigningUp: true });
    try {
      set({ isSigningUp: true });
      const resp = await axiosInstance.post("/auth/login", data);
      set({ authUser: resp.data });
      toast.success("Logged in Successfully");
      //socket.io is Added
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("signup error");
    } finally {
      set({ isSigningUp: false });
    }
  },
  updateprofile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const resp = axiosInstance.put("/auth/update-profile", data);
      set({ authUser: resp.data });
      toast.success("Profile updated  Successfully");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("profile update  error");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket.connected) {
      get().socket.disconnect();
    }
  },
}));
