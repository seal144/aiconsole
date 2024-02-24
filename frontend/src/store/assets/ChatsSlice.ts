import { StateCreator } from 'zustand';
import { AssetsAPI } from '../../api/api/AssetsAPI';
import { AICChatHeadline } from '@/types/assets/chatTypes';
import { EditablesStore } from './useEditablesStore';
import { useProjectStore } from '@/store/projects/useProjectStore';

export type ChatsSlice = {
  chats: AICChatHeadline[];
  initChatHistory: () => Promise<void>;
};

export const createChatsSlice: StateCreator<EditablesStore, [], [], ChatsSlice> = (set) => ({
  chats: [],
  initChatHistory: async () => {
    set({ chats: [] });
    if (!useProjectStore.getState().isProjectOpen) return;
    try {
      const chats: AICChatHeadline[] = await AssetsAPI.fetchAssets<AICChatHeadline>('chat');
      set(() => ({
        chats: chats,
      }));
    } catch (e) {
      set(() => ({
        chats: [],
      }));
      console.log(e);
    }
  },
});
