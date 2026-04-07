import { create } from 'zustand';
import {
  sites,
  Site,
  workOrders as initialWorkOrders,
  pmSchedules as initialPMSchedules,
  notifications as initialNotifications,
  WorkOrder,
  PMSchedule,
  AppNotification,
} from '../data/mockData';

export type AssetHealthBand = 'all' | 'critical' | 'at_risk' | 'healthy';

interface AppState {
  selectedSiteId: string | null;
  setSelectedSiteId: (siteId: string | null) => void;
  selectedSite: Site | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  workOrders: WorkOrder[];
  pmSchedules: PMSchedule[];
  notifications: AppNotification[];
  assetHealthBandFilter: AssetHealthBand;
  setAssetHealthBandFilter: (band: AssetHealthBand) => void;
  generateWOFromPMSchedule: (pmSchedule: PMSchedule) => WorkOrder;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const extractIdNumber = (id: string) => Number(id.replace('wo-', '')) || 0;

const extractWONumberSequence = (number: string) => {
  const match = number.match(/WO-\d{4}-(\d+)/);
  return match ? Number(match[1]) : 0;
};

export const useStore = create<AppState>((set, get) => ({
  selectedSiteId: null,
  setSelectedSiteId: (siteId) =>
    set({
      selectedSiteId: siteId,
      selectedSite: siteId ? sites.find((site) => site.id === siteId) || null : null,
    }),
  selectedSite: null,
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  workOrders: initialWorkOrders,
  pmSchedules: initialPMSchedules,
  notifications: initialNotifications,
  assetHealthBandFilter: 'all',
  setAssetHealthBandFilter: (band) => set({ assetHealthBandFilter: band }),
  generateWOFromPMSchedule: (pmSchedule) => {
    const currentWorkOrders = get().workOrders;
    const now = new Date();
    const maxIdNumber = currentWorkOrders.reduce(
      (maxValue, workOrder) => Math.max(maxValue, extractIdNumber(workOrder.id)),
      0
    );
    const maxSequence = currentWorkOrders.reduce(
      (maxValue, workOrder) => Math.max(maxValue, extractWONumberSequence(workOrder.number)),
      0
    );

    const nextIdNumber = maxIdNumber + 1;
    const nextSequence = maxSequence + 1;
    const year = now.getFullYear();

    const generatedWO: WorkOrder = {
      id: `wo-${nextIdNumber}`,
      number: `WO-${year}-${String(nextSequence).padStart(5, '0')}`,
      siteId: pmSchedule.siteId,
      assetId: pmSchedule.assetId,
      title: `PM Generated - ${pmSchedule.name}`,
      description: `Auto-generated from PM schedule ${pmSchedule.name}.`,
      faultType: 'Preventive Maintenance',
      priority: 'P3',
      status: 'open',
      slaDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      checklist: pmSchedule.checklist.map((item, index) => ({
        id: `${pmSchedule.id}-check-${index + 1}`,
        text: item,
        completed: false,
      })),
    };

    set((state) => ({
      workOrders: [generatedWO, ...state.workOrders],
    }));

    return generatedWO;
  },
  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
}));
