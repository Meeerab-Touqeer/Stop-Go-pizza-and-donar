import { create } from 'zustand';

type UiState = {
  searchOpen: boolean;
  menuOpen: boolean;
  productId: string | null;
  editingLineId: string | null;
  message: string;
  toast: (message: string) => void;
  openSearch: (open: boolean) => void;
  openMenu: (open: boolean) => void;
  openProduct: (productId: string, lineId?: string) => void;
  closeProduct: () => void;
};

export const useUi = create<UiState>((set) => ({
  searchOpen: false,
  menuOpen: false,
  productId: null,
  editingLineId: null,
  message: '',
  toast(message) {
    set({ message });
    window.setTimeout(() => set({ message: '' }), 2400);
  },
  openSearch(searchOpen) {
    set({ searchOpen });
  },
  openMenu(menuOpen) {
    set({ menuOpen });
  },
  openProduct(productId, editingLineId) {
    set({ productId, editingLineId: editingLineId || null, menuOpen: false, searchOpen: false });
  },
  closeProduct() {
    set({ productId: null, editingLineId: null });
  },
}));
