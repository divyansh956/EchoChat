import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async (userId) => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get(`/users?filters[id][$ne]=${userId}`);
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (senderId) => {
    set({ isMessagesLoading: true });
    try {
      const receiverId = get().selectedUser.id;
      const res = await axiosInstance.get(
        `/messages?populate[sender][fields]=id&populate[receiver][fields]=id` +
          `&filters[$or][0][$and][0][sender][id]=${senderId}&filters[$or][0][$and][1][receiver][id]=${receiverId}` +
          `&filters[$or][1][$and][0][sender][id]=${receiverId}&filters[$or][1][$and][1][receiver][id]=${senderId}`
      );
      set({ messages: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.post(
        `/messages?populate[sender][fields]=id&populate[receiver][fields]=id`,
        messageData
      );
      set({ messages: [...get().messages, res.data.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
