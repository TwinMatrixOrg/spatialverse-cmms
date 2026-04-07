import { addHours } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  getUserById,
  getAssetById,
  getChecklistTemplate,
  getDefaultWorkOrderComments,
  nextStatusMap,
  prioritySLAHours,
  Site,
  sites,
  WorkOrder,
  WorkOrderApprovalStatus,
  WorkOrderApprovalStep,
  WorkOrderStatus,
  workOrders as seedWorkOrders,
  workOrderStatusLabels,
  Priority,
  Permit,
  PermitRiskLevel,
  PermitStatus,
  PermitType,
  PMSchedule,
  AppNotification,
  permits as seedPermits,
  RootCause,
  pmSchedules as initialPMSchedules,
  notifications as initialNotifications,
  WorkOrderLabourEntry,
  WorkOrderPartUsedEntry,
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

interface AddLabourEntryInput {
  technicianId: string;
  technicianName: string;
  hours: number;
  ratePerHour: number;
  date?: string;
  description?: string;
}

interface AddPartsEntryInput {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  date?: string;
}

interface CreatePermitInput {
  workOrderId: string;
  type?: PermitType;
  riskLevel?: PermitRiskLevel;
  location?: string;
  issuedById?: string;
  validFrom?: string;
  validTo?: string;
  precautions?: string[];
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
  addLabourEntry: (workOrderId: string, entry: AddLabourEntryInput) => void;
  addPartsEntry: (workOrderId: string, entry: AddPartsEntryInput) => void;
  approveWorkOrder: (
    workOrderId: string,
    level: 1 | 2,
    approverId: string,
    approverName: string,
    comment?: string
  ) => void;
  rejectWorkOrder: (
    workOrderId: string,
    level: 1 | 2,
    approverId: string,
    approverName: string,
    comment: string
  ) => void;
  permits: Permit[];
  nextPermitSequence: number;
  createPermit: (input: CreatePermitInput) => Permit;
  updatePermitStatus: (permitId: string, status: PermitStatus) => void;
  togglePermitChecklistItem: (permitId: string, checklistItemId: string, completedById?: string) => void;
  saveRCA: (
    workOrderId: string,
    rootCause: RootCause,
    failureMode: string,
    correctiveAction: string
  ) => void;
  pmSchedules: PMSchedule[];
  notifications: AppNotification[];
  checkAndEscalateSlaBreaches: () => void;
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

const calculateLabourCost = (entries: WorkOrderLabourEntry[]) =>
  entries.reduce((sum, entry) => sum + entry.hours * entry.ratePerHour, 0);

const calculatePartsCost = (entries: WorkOrderPartUsedEntry[]) =>
  entries.reduce((sum, entry) => sum + entry.quantity * entry.unitCost, 0);

const normalizeWorkOrderCosts = (workOrder: WorkOrder): WorkOrder => {
  const labourEntries = workOrder.labourEntries || [];
  const partsUsed = workOrder.partsUsed || [];
  const totalLabourCost =
    Number.isFinite(workOrder.totalLabourCost) && workOrder.totalLabourCost > 0
      ? workOrder.totalLabourCost
      : calculateLabourCost(labourEntries);
  const totalPartsCost =
    Number.isFinite(workOrder.totalPartsCost) && workOrder.totalPartsCost > 0
      ? workOrder.totalPartsCost
      : calculatePartsCost(partsUsed);

  return {
    ...workOrder,
    labourEntries,
    partsUsed,
    totalLabourCost,
    totalPartsCost,
    totalCost:
      Number.isFinite(workOrder.totalCost) && workOrder.totalCost > 0
        ? workOrder.totalCost
        : totalLabourCost + totalPartsCost,
  };
};

const createDefaultApprovalChain = (): WorkOrderApprovalStep[] => [
  { level: 1, role: 'Supervisor' },
  { level: 2, role: 'FM Manager' },
];

const cloneApprovalChain = (chain?: WorkOrderApprovalStep[]): WorkOrderApprovalStep[] =>
  (chain && chain.length > 0 ? chain : createDefaultApprovalChain()).map((step) => ({ ...step }));

const getNextApprovalStatusAfterApproval = (level: 1 | 2): WorkOrderApprovalStatus => {
  if (level === 1) {
    return 'pending_manager';
  }

  return 'approved';
};

const hydratedWorkOrders = seedWorkOrders.map((workOrder) => {
  const asset = getAssetById(workOrder.assetId);
  const reportedById = workOrder.reportedById || 'user-2';

  return normalizeWorkOrderCosts({
    ...workOrder,
    slaBreached: workOrder.slaBreached ?? false,
    escalationLog: workOrder.escalationLog ?? [],
    reportedById,
    approvalStatus: workOrder.approvalStatus || 'not_required',
    approvalChain: cloneApprovalChain(workOrder.approvalChain),
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
  });
});

const initialSequence =
  hydratedWorkOrders.reduce((highest, workOrder) => {
    return Math.max(highest, extractSequence(workOrder.number));
  }, 0) + 1;

const permitStatusTransitions: Record<PermitStatus, PermitStatus[]> = {
  draft: ['issued', 'cancelled'],
  issued: ['active', 'cancelled'],
  active: ['closed', 'cancelled'],
  closed: [],
  cancelled: [],
};

const defaultPermitPrecautions = [
  'Conduct toolbox talk before start of work',
  'Ensure permit and isolation tags are displayed at work site',
  'Keep emergency response contact list available on site',
];

const createDefaultPermitChecklist = (permitId: string): Permit['safetyChecklist'] => [
  {
    id: `${permitId}-pre-1`,
    phase: 'pre',
    item: 'Review hazards, method statement, and emergency controls',
    completed: false,
  },
  {
    id: `${permitId}-pre-2`,
    phase: 'pre',
    item: 'Verify PPE, tools, and area access control',
    completed: false,
  },
  {
    id: `${permitId}-during-1`,
    phase: 'during',
    item: 'Maintain supervision and periodic hazard checks',
    completed: false,
  },
  {
    id: `${permitId}-during-2`,
    phase: 'during',
    item: 'Keep permit and isolation controls active throughout work',
    completed: false,
  },
  {
    id: `${permitId}-post-1`,
    phase: 'post',
    item: 'Remove temporary controls and restore work area',
    completed: false,
  },
  {
    id: `${permitId}-post-2`,
    phase: 'post',
    item: 'Perform handover briefing and capture closure evidence',
    completed: false,
  },
];

const initialPermitSequence =
  seedPermits.reduce((highest, permit) => Math.max(highest, extractSequence(permit.permitNumber)), 0) + 1;

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
      permits: seedPermits,
      nextPermitSequence: initialPermitSequence,
      pmSchedules: initialPMSchedules,
      notifications: initialNotifications,
      checkAndEscalateSlaBreaches: () => {
        const timestamp = new Date().toISOString();
        const activeStatuses: WorkOrderStatus[] = ['open', 'assigned', 'in_progress', 'pending_parts'];

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            const isActive = activeStatuses.includes(workOrder.status);
            const isOverdue = new Date(workOrder.slaDeadline).getTime() < Date.now();

            if (!isActive || !isOverdue || workOrder.slaBreached) {
              return workOrder;
            }

            return {
              ...workOrder,
              slaBreached: true,
              slaBreachTime: timestamp,
              updatedAt: timestamp,
              escalationLog: [
                ...(workOrder.escalationLog || []),
                {
                  timestamp,
                  notifiedRole: 'Supervisor',
                  notifiedName: 'Control Room Supervisor',
                  method: 'system',
                  message: `Auto-escalation: ${workOrder.number} exceeded SLA deadline.`,
                },
              ],
            };
          }),
        }));
      },
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
          slaBreached: false,
          escalationLog: [],
          createdAt,
          updatedAt: createdAt,
          approvalStatus: 'not_required',
          approvalChain: createDefaultApprovalChain(),
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
          labourEntries: [],
          partsUsed: [],
          totalLabourCost: 0,
          totalPartsCost: 0,
          totalCost: 0,
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
      createPermit: (input) => {
        const existingPermit = get().permits.find((permit) => permit.workOrderId === input.workOrderId);
        if (existingPermit) {
          return existingPermit;
        }

        const now = new Date();
        const sequence = get().nextPermitSequence;
        const permitId = `permit-${Date.now()}`;
        const permitNumber = `PTW-${now.getFullYear()}-${String(sequence).padStart(4, '0')}`;
        const workOrder = get().workOrders.find((item) => item.id === input.workOrderId);
        const asset = workOrder ? getAssetById(workOrder.assetId) : null;
        const issuedById = input.issuedById || 'user-2';
        const issuedByUser = getUserById(issuedById);
        const fallbackLocation = [asset?.floor, asset?.zone].filter(Boolean).join(' • ') || asset?.name || 'Work Area';

        const permit: Permit = {
          id: permitId,
          workOrderId: input.workOrderId,
          permitNumber,
          type: input.type || 'general',
          status: 'draft',
          issuedById,
          issuedByName: issuedByUser ? `${issuedByUser.firstName} ${issuedByUser.lastName}` : 'Duty Manager',
          validFrom: input.validFrom || now.toISOString(),
          validTo: input.validTo || addHours(now, 8).toISOString(),
          location: input.location?.trim() || fallbackLocation,
          riskLevel: input.riskLevel || 'medium',
          precautions:
            input.precautions && input.precautions.length > 0
              ? input.precautions
              : [...defaultPermitPrecautions],
          safetyChecklist: createDefaultPermitChecklist(permitId),
        };

        set((state) => ({
          permits: [permit, ...state.permits],
          nextPermitSequence: state.nextPermitSequence + 1,
        }));

        return permit;
      },
      updatePermitStatus: (permitId, status) => {
        set((state) => ({
          permits: state.permits.map((permit) => {
            if (permit.id !== permitId) {
              return permit;
            }

            if (permit.status === status) {
              return permit;
            }

            const allowedNextStatuses = permitStatusTransitions[permit.status] || [];
            if (!allowedNextStatuses.includes(status)) {
              return permit;
            }

            if (status === 'closed') {
              const postWorkComplete = permit.safetyChecklist
                .filter((item) => item.phase === 'post')
                .every((item) => item.completed);

              if (!postWorkComplete) {
                return permit;
              }
            }

            return {
              ...permit,
              status,
            };
          }),
        }));
      },
      addLabourEntry: (workOrderId, entry) => {
        if (entry.hours <= 0 || entry.ratePerHour <= 0) {
          return;
        }

        const entryDate = entry.date || new Date().toISOString();
        const nowIso = new Date().toISOString();

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) {
              return workOrder;
            }

            const currentLabourEntries = workOrder.labourEntries || [];
            const currentPartsEntries = workOrder.partsUsed || [];
            const labourEntries = [
              ...currentLabourEntries,
              {
                id: `lab-${workOrder.id}-${Date.now()}`,
                technicianId: entry.technicianId,
                technicianName: entry.technicianName,
                hours: entry.hours,
                ratePerHour: entry.ratePerHour,
                date: entryDate,
                description: entry.description,
              },
            ];
            const totalLabourCost = calculateLabourCost(labourEntries);
            const totalPartsCost = calculatePartsCost(currentPartsEntries);

            return {
              ...workOrder,
              updatedAt: nowIso,
              labourEntries,
              totalLabourCost,
              totalPartsCost,
              totalCost: totalLabourCost + totalPartsCost,
            };
          }),
        }));
      },
      togglePermitChecklistItem: (permitId, checklistItemId, completedById = 'user-2') => {
        const timestamp = new Date().toISOString();

        set((state) => ({
          permits: state.permits.map((permit) => {
            if (permit.id !== permitId) {
              return permit;
            }

            return {
              ...permit,
              safetyChecklist: permit.safetyChecklist.map((item) => {
                if (item.id !== checklistItemId) {
                  return item;
                }

                const nextCompleted = !item.completed;

                return {
                  ...item,
                  completed: nextCompleted,
                  completedBy: nextCompleted ? completedById : undefined,
                  completedAt: nextCompleted ? timestamp : undefined,
                };
              }),
            };
          }),
        }));
      },
      addPartsEntry: (workOrderId, entry) => {
        if (entry.quantity <= 0 || entry.unitCost <= 0) {
          return;
        }

        const entryDate = entry.date || new Date().toISOString();
        const nowIso = new Date().toISOString();

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) {
              return workOrder;
            }

            const currentLabourEntries = workOrder.labourEntries || [];
            const currentPartsEntries = workOrder.partsUsed || [];
            const partsUsed = [
              ...currentPartsEntries,
              {
                id: `part-${workOrder.id}-${Date.now()}`,
                inventoryItemId: entry.inventoryItemId,
                itemName: entry.itemName,
                quantity: entry.quantity,
                unitCost: entry.unitCost,
                date: entryDate,
              },
            ];
            const totalLabourCost = calculateLabourCost(currentLabourEntries);
            const totalPartsCost = calculatePartsCost(partsUsed);

            return {
              ...workOrder,
              updatedAt: nowIso,
              partsUsed,
              totalLabourCost,
              totalPartsCost,
              totalCost: totalLabourCost + totalPartsCost,
            };
          }),
        }));
      },
      approveWorkOrder: (workOrderId, level, approverId, approverName, comment) => {
        const trimmedComment = comment?.trim();
        const timestamp = new Date().toISOString();

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) {
              return workOrder;
            }

            const approvalChain = cloneApprovalChain(workOrder.approvalChain).map((step) =>
              step.level === level
                ? {
                    ...step,
                    approverId,
                    approverName,
                    action: 'approved' as const,
                    comment: trimmedComment || step.comment,
                    timestamp,
                  }
                : step
            );

            const nextApprovalStatus = getNextApprovalStatusAfterApproval(level);
            const timelineEntry = {
              id: `tl-${workOrder.id}-approval-${timestamp}`,
              type: 'approval',
              description:
                level === 1
                  ? `Supervisor approval completed by ${approverName}`
                  : `FM Manager approval completed by ${approverName}`,
              userId: approverId,
              createdAt: timestamp,
            };

            return {
              ...workOrder,
              status: level === 2 ? 'assigned' : workOrder.status,
              approvalStatus: nextApprovalStatus,
              approvalChain,
              updatedAt: timestamp,
              timeline: [...(workOrder.timeline || []), timelineEntry],
              comments: trimmedComment
                ? [
                    ...(workOrder.comments || []),
                    {
                      id: `cm-${workOrder.id}-approval-${timestamp}`,
                      userId: approverId,
                      message: `Approval note (${approverName}): ${trimmedComment}`,
                      createdAt: timestamp,
                    },
                  ]
                : workOrder.comments,
            };
          }),
        }));
      },
      rejectWorkOrder: (workOrderId, level, approverId, approverName, comment) => {
        const trimmedComment = comment.trim();

        if (!trimmedComment) {
          return;
        }

        const timestamp = new Date().toISOString();

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) {
              return workOrder;
            }

            const approvalChain = cloneApprovalChain(workOrder.approvalChain).map((step) =>
              step.level === level
                ? {
                    ...step,
                    approverId,
                    approverName,
                    action: 'rejected' as const,
                    comment: trimmedComment,
                    timestamp,
                  }
                : step
            );

            return {
              ...workOrder,
              approvalStatus: 'rejected',
              approvalChain,
              updatedAt: timestamp,
              timeline: [
                ...(workOrder.timeline || []),
                {
                  id: `tl-${workOrder.id}-rejection-${timestamp}`,
                  type: 'approval',
                  description: `Approval rejected by ${approverName}`,
                  userId: approverId,
                  createdAt: timestamp,
                },
              ],
              comments: [
                ...(workOrder.comments || []),
                {
                  id: `cm-${workOrder.id}-rejection-${timestamp}`,
                  userId: approverId,
                  message: `Rejection reason (${approverName}): ${trimmedComment}`,
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
          approvalStatus: 'not_required',
          approvalChain: createDefaultApprovalChain(),
          slaDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          slaBreached: false,
          escalationLog: [],
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
          labourEntries: [],
          partsUsed: [],
          totalLabourCost: 0,
          totalPartsCost: 0,
          totalCost: 0,
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
      onRehydrateStorage: () => (state) => {
        state?.checkAndEscalateSlaBreaches();
      },
      partialize: (state) => ({
        workOrders: state.workOrders,
        nextWorkOrderSequence: state.nextWorkOrderSequence,
        permits: state.permits,
        nextPermitSequence: state.nextPermitSequence,
      }),
    }
  )
);

useStore.getState().checkAndEscalateSlaBreaches();
