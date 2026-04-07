import { addHours } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  getAssetById,
  getChecklistTemplate,
  getDefaultWorkOrderComments,
  nextStatusMap,
  prioritySLAHours,
  Site,
  sites,
  WorkOrder,
  WorkOrderStatus,
  workOrders as seedWorkOrders,
  workOrderStatusLabels,
  Priority,
  PMSchedule,
  AppNotification,
  RootCause,
  pmSchedules as initialPMSchedules,
  notifications as initialNotifications,
} from '../data/mockData';

interface CreateWorkOrderInput {
  assetId: string;
  faultType: string;
  description: string;
  priority: Priority;
  assignedToId?: string;
  estimatedHours?: number;
  reportedById?: string;
}

interface UpdateWorkOrderStatusInput {
  workOrderId: string;
  status: WorkOrderStatus;
  userId?: string;
  comment?: string;
}

export type AssetHealthBand = 'all' | 'critical' | 'at_risk' | 'healthy';

interface AppState {
  selectedSiteId: string | null;
  setSelectedSiteId: (siteId: string | null) => void;
  selectedSite: Site | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  workOrders: WorkOrder[];
  nextWorkOrderSequence: number;
  createWorkOrder: (input: CreateWorkOrderInput) => WorkOrder;
  updateWorkOrderStatus: (input: UpdateWorkOrderStatusInput) => void;
  toggleChecklistItem: (workOrderId: string, checklistItemId: string) => void;
  addWorkOrderComment: (workOrderId: string, message: string, userId?: string) => void;
  saveRCA: (
    workOrderId: string,
    rootCause: RootCause,
    failureMode: string,
    correctiveAction: string
  ) => void;
  pmSchedules: PMSchedule[];
  notifications: AppNotification[];
  assetHealthBandFilter: AssetHealthBand;
  setAssetHealthBandFilter: (band: AssetHealthBand) => void;
  generateWOFromPMSchedule: (pmSchedule: PMSchedule) => WorkOrder;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const extractSequence = (number: string) => {
  const match = number.match(/(\d+)(?!.*\d)/);
  return match ? Number.parseInt(match[1], 10) : 0;
};

const hydratedWorkOrders = seedWorkOrders.map((workOrder) => {
  const asset = getAssetById(workOrder.assetId);
  const reportedById = workOrder.reportedById || 'user-2';

  return {
    ...workOrder,
    reportedById,
    checklist:
      workOrder.checklist && workOrder.checklist.length > 0
        ? workOrder.checklist
        : getChecklistTemplate(workOrder.faultType, asset?.type),
    timeline:
      workOrder.timeline && workOrder.timeline.length > 0
        ? workOrder.timeline
        : [
            {
              id: `tl-${workOrder.id}-created`,
              type: 'created',
              description: 'Work order created',
              userId: reportedById,
              createdAt: workOrder.createdAt,
            },
          ],
    comments:
      workOrder.comments && workOrder.comments.length > 0
        ? workOrder.comments
        : getDefaultWorkOrderComments(workOrder.id),
  };
});

const initialSequence =
  hydratedWorkOrders.reduce((highest, workOrder) => {
    return Math.max(highest, extractSequence(workOrder.number));
  }, 0) + 1;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      workOrders: hydratedWorkOrders,
      nextWorkOrderSequence: initialSequence,
      pmSchedules: initialPMSchedules,
      notifications: initialNotifications,
      assetHealthBandFilter: 'all',
      setAssetHealthBandFilter: (band) => set({ assetHealthBandFilter: band }),
      createWorkOrder: (input) => {
        const createdAt = new Date().toISOString();
        const asset = getAssetById(input.assetId);
        const sequence = get().nextWorkOrderSequence;
        const status: WorkOrderStatus = input.assignedToId ? 'assigned' : 'open';
        const workOrderId = `wo-${Date.now()}`;
        const number = `WO-${String(sequence).padStart(3, '0')}`;
        const reportedById = input.reportedById || 'user-2';

        const workOrder: WorkOrder = {
          id: workOrderId,
          number,
          siteId: asset?.siteId || 'site-1',
          assetId: input.assetId,
          title: `${asset?.name || 'Asset'} ${input.faultType} issue`,
          description: input.description,
          faultType: input.faultType,
          priority: input.priority,
          status,
          assignedToId: input.assignedToId || undefined,
          reportedById,
          estimatedHours: input.estimatedHours,
          slaDeadline: addHours(new Date(), prioritySLAHours[input.priority]).toISOString(),
          createdAt,
          updatedAt: createdAt,
          checklist: getChecklistTemplate(input.faultType, asset?.type),
          timeline: [
            {
              id: `tl-${workOrderId}-created`,
              type: 'created',
              description: 'Work order created',
              userId: reportedById,
              createdAt,
            },
            ...(input.assignedToId
              ? [
                  {
                    id: `tl-${workOrderId}-assigned`,
                    type: 'assigned',
                    description: 'Work order assigned',
                    userId: reportedById,
                    createdAt,
                  },
                ]
              : []),
          ],
          comments: [
            {
              id: `cm-${workOrderId}-1`,
              userId: reportedById,
              message: 'Work order created from dispatch console.',
              createdAt,
            },
          ],
        };

        set((state) => ({
          workOrders: [workOrder, ...state.workOrders],
          nextWorkOrderSequence: state.nextWorkOrderSequence + 1,
        }));

        return workOrder;
      },
      updateWorkOrderStatus: ({ workOrderId, status, userId = 'user-2', comment }) => {
        const timestamp = new Date().toISOString();

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) {
              return workOrder;
            }

            const statusChanged = workOrder.status !== status;
            const nextStatuses = nextStatusMap[workOrder.status] || [];
            const canMove = statusChanged ? nextStatuses.includes(status) : true;

            if (!canMove) {
              return workOrder;
            }

            return {
              ...workOrder,
              status,
              updatedAt: timestamp,
              resolvedAt: status === 'resolved' ? workOrder.resolvedAt || timestamp : workOrder.resolvedAt,
              closedAt: status === 'closed' ? workOrder.closedAt || timestamp : workOrder.closedAt,
              timeline: [
                ...(workOrder.timeline || []),
                ...(statusChanged
                  ? [
                      {
                        id: `tl-${workOrder.id}-${timestamp}`,
                        type: 'status_change',
                        description: `Status updated to ${workOrderStatusLabels[status]}`,
                        userId,
                        createdAt: timestamp,
                      },
                    ]
                  : []),
              ],
              comments: comment?.trim()
                ? [
                    ...(workOrder.comments || []),
                    {
                      id: `cm-${workOrder.id}-${timestamp}`,
                      userId,
                      message: comment.trim(),
                      createdAt: timestamp,
                    },
                  ]
                : workOrder.comments,
            };
          }),
        }));
      },
      toggleChecklistItem: (workOrderId, checklistItemId) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId || !workOrder.checklist) {
              return workOrder;
            }

            return {
              ...workOrder,
              updatedAt: new Date().toISOString(),
              checklist: workOrder.checklist.map((item) =>
                item.id === checklistItemId ? { ...item, completed: !item.completed } : item
              ),
            };
          }),
        }));
      },
      addWorkOrderComment: (workOrderId, message, userId = 'user-2') => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
          return;
        }

        const timestamp = new Date().toISOString();

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) {
              return workOrder;
            }

            return {
              ...workOrder,
              updatedAt: timestamp,
              comments: [
                ...(workOrder.comments || []),
                {
                  id: `cm-${workOrder.id}-${timestamp}`,
                  userId,
                  message: trimmedMessage,
                  createdAt: timestamp,
                },
              ],
            };
          }),
        }));
      },
      saveRCA: (workOrderId, rootCause, failureMode, correctiveAction) => {
        const timestamp = new Date().toISOString();
        const trimmedFailureMode = failureMode.trim();
        const trimmedCorrectiveAction = correctiveAction.trim();

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) {
              return workOrder;
            }

            const rcaExists = Boolean(workOrder.rootCause || workOrder.failureMode || workOrder.correctiveAction);

            return {
              ...workOrder,
              rootCause,
              failureMode: trimmedFailureMode,
              correctiveAction: trimmedCorrectiveAction,
              updatedAt: timestamp,
              timeline: [
                ...(workOrder.timeline || []),
                {
                  id: `tl-${workOrder.id}-rca-${timestamp}`,
                  type: 'rca',
                  description: rcaExists ? 'RCA updated' : 'RCA captured',
                  userId: 'user-2',
                  createdAt: timestamp,
                },
              ],
            };
          }),
        }));
      },
      generateWOFromPMSchedule: (pmSchedule) => {
        const currentWorkOrders = get().workOrders;
        const now = new Date();
        const maxIdNumber = currentWorkOrders.reduce(
          (maxValue, workOrder) => Math.max(maxValue, extractSequence(workOrder.id)),
          0
        );
        const maxSequence = currentWorkOrders.reduce(
          (maxValue, workOrder) => Math.max(maxValue, extractSequence(workOrder.number)),
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
          timeline: [
            {
              id: `tl-${nextIdNumber}-created`,
              type: 'created',
              description: 'Work order created from PM schedule',
              userId: 'user-1',
              createdAt: now.toISOString(),
            },
          ],
          comments: [
            {
              id: `cm-${nextIdNumber}-1`,
              userId: 'user-1',
              message: 'Auto-generated from PM schedule.',
              createdAt: now.toISOString(),
            },
          ],
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
    }),
    {
      name: 'sv-pulse-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workOrders: state.workOrders,
        nextWorkOrderSequence: state.nextWorkOrderSequence,
      }),
    }
  )
);
