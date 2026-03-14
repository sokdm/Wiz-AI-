import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      conversations: [],
      currentConversation: null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, conversations: [], currentConversation: null });
      },
      
      setConversations: (conversations) => set({ conversations }),
      addConversation: (conversation) => 
        set((state) => ({ conversations: [conversation, ...state.conversations] })),
      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c._id !== id),
        })),
    }),
    {
      name: 'wizai-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
