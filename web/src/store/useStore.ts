import { create } from 'zustand';
import { sites, Site } from '../data/mockData';

interface AppState {
  selectedSiteId: string | null;
  setSelectedSiteId: (siteId: string | null) => void;
  selectedSite: Site | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  selectedSiteId: null,
  setSelectedSiteId: (siteId) => set({
    selectedSiteId: siteId,
    selectedSite: siteId ? sites.find(s => s.id === siteId) || null : null
  }),
  selectedSite: null,
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}));
