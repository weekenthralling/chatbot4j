import { create } from "zustand";
import { ConversationDTO } from "@/request/types";

interface Pagination {
  total: number;
  current_page?: string;
  current_page_backwards?: string;
  previous_page?: string;
  next_page?: string;
}

interface UpdateConv {
  id: string;
  title?: string;
  pinned?: boolean;
}

// 定义 store 的类型
interface ConvsState {
  convs: ConversationDTO[];
  pagination: Pagination;
  setConvs: (convs: ConversationDTO[]) => void;
  addConv: (conv: ConversationDTO) => void;
  updateConv: (conv: UpdateConv) => void;
  removeConv: (id: string) => void;
  moveTopByConvId: (id: string) => void;
  setPagination: (pagination: Pagination) => void;
}

const sortConvs = (convs: ConversationDTO[]) => {
  const newConvs = [...convs];
  newConvs.sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) {
      return Number(!!b.pinned) - Number(!!a.pinned);
    }
    return (
      (b.last_message_at ? new Date(b.last_message_at).getTime() : 0) -
      (a.last_message_at ? new Date(a.last_message_at).getTime() : 0)
    );
  });
  return newConvs;
};

export const useConvsStore = create<ConvsState>()((set) => ({
  convs: [],
  pagination: {
    total: 0,
  },
  setConvs: (convs) => set(() => ({ convs })),
  addConv: (conv) =>
    set((state) => {
      const idxFirstUnpinned = state.convs.findIndex((item) => !item.pinned);
      if (idxFirstUnpinned === -1) {
        return { convs: [conv, ...state.convs] };
      } else {
        const newConvs = [...state.convs];
        newConvs.splice(idxFirstUnpinned, 0, conv);
        return {
          convs: newConvs,
        };
      }
    }),
  removeConv: (id) =>
    set((state) => ({
      convs: state.convs.filter((item) => item.id !== id),
    })),
  updateConv: (conv) =>
    set((state) => ({
      convs: sortConvs(
        state.convs.map((item) => {
          if (item.id === conv.id) {
            return { ...item, ...conv };
          }
          return item;
        }),
      ),
    })),
  moveTopByConvId: (id) =>
    set((state) => {
      if (!state.convs.length) return { convs: [] };
      // Already at the top, no need to move
      if (state.convs[0].id === id) return { convs: state.convs };
      const newState = [...state.convs];
      // The index of the item to move
      const idxToMove = newState.findIndex((item) => item.id === id);
      // The index of the first unpinned item. Must be recalculated before popping the item
      const idxFirstUnpinned = newState.findIndex((item) => !item.pinned);

      // The index of the item to move is same with index of the first unpinned item
      if (idxFirstUnpinned === idxToMove) return { convs: state.convs };
      // Pop the item to move
      const toMove = newState.splice(idxToMove, 1)[0];
      toMove.last_message_at = new Date().toISOString();

      if (idxFirstUnpinned === -1 || toMove.pinned) {
        // If there's no pinned item, or the item to move is pinned, move to the top
        return {
          convs: [toMove, ...newState],
        };
      } else {
        // Otherwise, insert after the last pinned item
        newState.splice(idxFirstUnpinned, 0, toMove);
        return {
          convs: newState,
        };
      }
    }),
  setPagination: (pagination) => set(() => ({ pagination })),
}));

export const { setConvs, addConv, updateConv, removeConv, moveTopByConvId, setPagination } =
  useConvsStore.getState();
