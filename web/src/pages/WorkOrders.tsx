import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Step,
  StepLabel,
  Stepper,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Circle as CircleIcon,
  Close as CloseIcon,
  EmailOutlined as EmailIcon,
  Search as SearchIcon,
  Send as SendIcon,
  SettingsSuggest as SystemIcon,
  SmsOutlined as SmsIcon,
  ViewKanban as KanbanIcon,
  ViewList as ListIcon,
} from '@mui/icons-material';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, formatDistanceToNow } from 'date-fns';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLocation } from 'react-router-dom';
import {
  assets,
  getAssetById,
  getSiteById,
  getUserById,
  inventoryItems,
  nextStatusMap,
  Priority,
  prioritySLAHours,
  Permit,
  permitStatusLabels,
  permitTypeLabels,
  RootCause,
  technicians,
  WorkOrder,
  WorkOrderApprovalStep,
  WorkOrderApprovalStatus,
  WorkOrderStatus,
  workOrderFaultTypes,
  workOrderStatusLabels,
} from '../data/mockData';
import { useStore } from '../store/useStore';

const statusColumns: { id: WorkOrderStatus; label: string; color: string }[] = [
  { id: 'open', label: 'Open', color: '#29B6F6' },
  { id: 'assigned', label: 'Assigned', color: '#AB47BC' },
  { id: 'in_progress', label: 'In Progress', color: '#FFA726' },
  { id: 'pending_parts', label: 'Pending Parts', color: '#78909C' },
  { id: 'resolved', label: 'Resolved', color: '#66BB6A' },
  { id: 'closed', label: 'Closed', color: '#90A4AE' },
];

const priorityColors: Record<Priority, string> = {
  P1: '#EF5350',
  P2: '#FFA726',
  P3: '#FFEE58',
  P4: '#66BB6A',
};

const approvalStatusLabels: Record<WorkOrderApprovalStatus, string> = {
  not_required: 'Not Required',
  pending_supervisor: 'Pending Supervisor',
  pending_manager: 'Pending FM Manager',
  approved: 'Approved',
  rejected: 'Rejected',
};

const approvalStatusColors: Record<WorkOrderApprovalStatus, string> = {
  not_required: '#90A4AE',
  pending_supervisor: '#FFA726',
  pending_manager: '#42A5F5',
  approved: '#66BB6A',
  rejected: '#EF5350',
};

const defaultApprovalChain: WorkOrderApprovalStep[] = [
  { level: 1 as const, role: 'Supervisor' as const },
  { level: 2 as const, role: 'FM Manager' as const },
];

const currentApprovalUser = {
  id: 'user-2',
  name: 'Lee Wei Ming',
  role: 'FM Manager' as const,
};

const getApprovalStatus = (workOrder: WorkOrder): WorkOrderApprovalStatus =>
  workOrder.approvalStatus || 'not_required';

const getApprovalChain = (workOrder: WorkOrder): WorkOrderApprovalStep[] =>
  (workOrder.approvalChain && workOrder.approvalChain.length > 0 ? workOrder.approvalChain : defaultApprovalChain).map(
    (step) => ({ ...step })
  );

function ApprovalStatusChip({ approvalStatus, size = 'small' }: { approvalStatus: WorkOrderApprovalStatus; size?: 'small' | 'medium' }) {
  const color = approvalStatusColors[approvalStatus];
  return (
    <Chip
      size={size}
      label={approvalStatusLabels[approvalStatus]}
      sx={{
        backgroundColor: alpha(color, 0.15),
        color,
        fontWeight: 600,
      }}
    />
  );
}

const permitStatusColors = {
  draft: '#90A4AE',
  issued: '#29B6F6',
  active: '#66BB6A',
  closed: '#78909C',
  cancelled: '#EF5350',
} as const;

const rootCauseOptions: { value: RootCause; label: string }[] = [
  { value: 'age_wear', label: 'Age / Wear' },
  { value: 'abuse_misuse', label: 'Abuse / Misuse' },
  { value: 'design_flaw', label: 'Design Flaw' },
  { value: 'installation_error', label: 'Installation Error' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'unknown', label: 'Unknown' },
];

const rootCauseLabelByValue = rootCauseOptions.reduce<Record<RootCause, string>>(
  (map, option) => ({ ...map, [option.value]: option.label }),
  {
    age_wear: 'Age / Wear',
    abuse_misuse: 'Abuse / Misuse',
    design_flaw: 'Design Flaw',
    installation_error: 'Installation Error',
    environmental: 'Environmental',
    unknown: 'Unknown',
  }
);

type CreateWorkOrderFormData = {
  assetId: string;
  faultType: string;
  priority: Priority;
  description: string;
  assignedToId?: string;
  estimatedHours?: number;
};

const formatWONumber = (number: string) => (number.startsWith('#') ? number : `#${number}`);

const formatRM = (value: number) =>
  `RM ${value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const toDateInputValue = (isoDate: string) => format(new Date(isoDate), 'yyyy-MM-dd');

const formatDuration = (durationMs: number) => {
  const totalMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const getSLAState = (createdAt: string, deadline: string, now: Date) => {
  const createdTime = new Date(createdAt).getTime();
  const deadlineTime = new Date(deadline).getTime();
  const nowTime = now.getTime();
  const total = Math.max(deadlineTime - createdTime, 1);
  const elapsed = Math.max(nowTime - createdTime, 0);
  const remaining = deadlineTime - nowTime;
  const isOverdue = remaining < 0;

  return {
    isOverdue,
    timeLeft: isOverdue ? `-${formatDuration(Math.abs(remaining))}` : formatDuration(remaining),
    progress: Math.min((elapsed / total) * 100, 100),
  };
};

function useMinuteTicker() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return now;
}

function WOCard({ wo, now, onClick }: { wo: WorkOrder; now: Date; onClick: () => void }) {
  const theme = useTheme();
  const asset = getAssetById(wo.assetId);
  const assignee = wo.assignedToId ? getUserById(wo.assignedToId) : null;
  const { timeLeft, isOverdue } = getSLAState(wo.createdAt, wo.slaDeadline, now);
  const showSLA = !['resolved', 'closed'].includes(wo.status);
  const approvalStatus = getApprovalStatus(wo);
  const isBreached = wo.slaBreached && showSLA;

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        borderLeft: `4px solid ${isBreached ? '#EF5350' : priorityColors[wo.priority]}`,
        backgroundColor: isBreached ? alpha('#EF5350', 0.06) : undefined,
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
          backgroundColor: isBreached ? alpha('#EF5350', 0.1) : undefined,
        },
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {formatWONumber(wo.number)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            {isBreached && (
              <Chip
                size="small"
                label="SLA BREACHED"
                sx={{
                  backgroundColor: alpha('#EF5350', 0.15),
                  color: '#EF5350',
                  fontWeight: 700,
                  fontSize: '0.63rem',
                  height: 22,
                }}
              />
            )}
            <Chip
              size="small"
              label={wo.priority}
              sx={{
                backgroundColor: alpha(priorityColors[wo.priority], 0.15),
                color: priorityColors[wo.priority],
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
          {asset?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {wo.faultType}
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <ApprovalStatusChip approvalStatus={approvalStatus} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {showSLA ? (
            <Chip
              size="small"
              icon={<TimeIcon sx={{ fontSize: 12 }} />}
              label={timeLeft}
              sx={{
                backgroundColor: isOverdue ? alpha('#EF5350', 0.1) : alpha('#66BB6A', 0.1),
                color: isOverdue ? '#EF5350' : '#66BB6A',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 22,
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          ) : (
            <Box />
          )}
          {assignee && (
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: '0.65rem',
                bgcolor: 'primary.main',
              }}
            >
              {assignee.firstName[0]}
              {assignee.lastName[0]}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function SortableWOCard({ wo, now, onClick }: { wo: WorkOrder; now: Date; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: wo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <WOCard wo={wo} now={now} onClick={onClick} />
    </div>
  );
}

function KanbanColumn({
  column,
  wos,
  now,
  onCardClick,
}: {
  column: (typeof statusColumns)[0];
  wos: WorkOrder[];
  now: Date;
  onCardClick: (wo: WorkOrder) => void;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: { xs: 260, sm: 280 },
        minWidth: { xs: 260, sm: 280 },
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: column.color,
          }}
        />
        <Typography variant="subtitle2" fontWeight={600}>
          {column.label}
        </Typography>
        <Chip
          size="small"
          label={wos.length}
          sx={{
            height: 20,
            fontSize: '0.7rem',
            backgroundColor: alpha(column.color, 0.15),
            color: column.color,
          }}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          backgroundColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.02),
          borderRadius: 2,
          p: 1.5,
          maxHeight: 'calc(100vh - 320px)',
          overflowY: 'auto',
        }}
      >
        <SortableContext items={wos.map((workOrder) => workOrder.id)} strategy={verticalListSortingStrategy}>
          {wos.map((workOrder) => (
            <SortableWOCard
              key={workOrder.id}
              wo={workOrder}
              now={now}
              onClick={() => onCardClick(workOrder)}
            />
          ))}
        </SortableContext>
        {wos.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No work orders
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function WorkOrders() {
  const {
    selectedSiteId,
    workOrders,
    permits,
    updateWorkOrderStatus,
    createWorkOrder,
    createPermit,
    toggleChecklistItem,
    addWorkOrderComment,
    addLabourEntry,
    addPartsEntry,
    approveWorkOrder,
    rejectWorkOrder,
    saveRCA,
  } = useStore();
  const location = useLocation();
  const now = useMinuteTicker();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [listFilterTab, setListFilterTab] = useState<'all' | 'my_approvals'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [slaFilter, setSlaFilter] = useState<'all' | 'breached'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedWOId, setSelectedWOId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreatedSnackbar, setShowCreatedSnackbar] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const selectedWO = useMemo(
    () => workOrders.find((workOrder) => workOrder.id === selectedWOId) || null,
    [workOrders, selectedWOId]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const workOrderIdFromQuery = params.get('wo');

    if (workOrderIdFromQuery && workOrders.some((workOrder) => workOrder.id === workOrderIdFromQuery)) {
      setSelectedWOId(workOrderIdFromQuery);
    }
  }, [location.search, workOrders]);

  const myApprovalsCount = useMemo(
    () =>
      workOrders.filter((workOrder) => {
        if (selectedSiteId && workOrder.siteId !== selectedSiteId) return false;
        return ['pending_supervisor', 'pending_manager'].includes(getApprovalStatus(workOrder));
      }).length,
    [selectedSiteId, workOrders]
  );

  const filteredWOs = useMemo(() => {
    return workOrders.filter((workOrder) => {
      if (selectedSiteId && workOrder.siteId !== selectedSiteId) return false;
      if (
        listFilterTab === 'my_approvals' &&
        !['pending_supervisor', 'pending_manager'].includes(getApprovalStatus(workOrder))
      ) {
        return false;
      }
      if (priorityFilter !== 'all' && workOrder.priority !== priorityFilter) return false;
      if (slaFilter === 'breached' && !workOrder.slaBreached) return false;
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const asset = getAssetById(workOrder.assetId);
        return (
          workOrder.number.toLowerCase().includes(search) ||
          workOrder.title.toLowerCase().includes(search) ||
          Boolean(asset?.name.toLowerCase().includes(search))
        );
      }
      return true;
    });
  }, [listFilterTab, priorityFilter, searchQuery, selectedSiteId, slaFilter, workOrders]);

  const wosByStatus = useMemo(() => {
    const grouped: Record<WorkOrderStatus, WorkOrder[]> = {
      open: [],
      assigned: [],
      in_progress: [],
      pending_parts: [],
      resolved: [],
      closed: [],
    };
    filteredWOs.forEach((workOrder) => {
      grouped[workOrder.status].push(workOrder);
    });
    return grouped;
  }, [filteredWOs]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeWO = workOrders.find((workOrder) => workOrder.id === active.id);
    if (!activeWO) return;

    const overWO = workOrders.find((workOrder) => workOrder.id === over.id);
    if (overWO && overWO.status !== activeWO.status) {
      updateWorkOrderStatus({
        workOrderId: activeWO.id,
        status: overWO.status,
        comment: `Moved to ${workOrderStatusLabels[overWO.status]} via Kanban board.`,
      });
    }
  };

  const activeWO = activeId ? workOrders.find((workOrder) => workOrder.id === activeId) : null;

  const handleCreateWorkOrder = (formData: CreateWorkOrderFormData) => {
    const createdWorkOrder = createWorkOrder(formData);
    setCreateDialogOpen(false);
    setSelectedWOId(createdWorkOrder.id);
    setShowCreatedSnackbar(true);
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 140px)',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.65rem', sm: '2rem' } }}>
          Work Orders
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
          Create Work Order
        </Button>
      </Box>

      <Tabs
        value={listFilterTab}
        onChange={(_, value: 'all' | 'my_approvals') => setListFilterTab(value)}
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab value="all" label="All Work Orders" />
        <Tab value="my_approvals" label={`My Approvals (${myApprovalsCount})`} />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search work orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 250 }, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 120 } }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(event) => setPriorityFilter(event.target.value as Priority | 'all')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="P1">P1</MenuItem>
            <MenuItem value="P2">P2</MenuItem>
            <MenuItem value="P3">P3</MenuItem>
            <MenuItem value="P4">P4</MenuItem>
          </Select>
        </FormControl>
        <Tabs
          value={slaFilter}
          onChange={(_, value: 'all' | 'breached') => setSlaFilter(value)}
          sx={{ minHeight: 36 }}
        >
          <Tab label="All" value="all" sx={{ minHeight: 36, minWidth: 72 }} />
          <Tab label="SLA Breached" value="breached" sx={{ minHeight: 36, minWidth: 120 }} />
        </Tabs>
        <Chip label={`${filteredWOs.length} work orders`} sx={{ alignSelf: 'center' }} />
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <ToggleButton value="kanban" sx={{ flex: { xs: 1, sm: 'initial' } }}>
            <KanbanIcon sx={{ mr: 0.5 }} /> Kanban
          </ToggleButton>
          <ToggleButton value="list" sx={{ flex: { xs: 1, sm: 'initial' } }}>
            <ListIcon sx={{ mr: 0.5 }} /> List
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flex: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 1,
              WebkitOverflowScrolling: 'touch',
              '& > *': { flexShrink: 0 },
            }}
          >
            {statusColumns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                wos={wosByStatus[column.id]}
                now={now}
                onCardClick={(workOrder) => setSelectedWOId(workOrder.id)}
              />
            ))}
          </Box>
          <DragOverlay>{activeWO && <WOCard wo={activeWO} now={now} onClick={() => {}} />}</DragOverlay>
        </DndContext>
      )}

      {viewMode === 'list' && (
        <TableContainer component={Paper} sx={{ flex: 1, overflowX: 'auto', maxWidth: '100%' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>WO #</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Fault Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Approval</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>SLA</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Assignee</TableCell>
                <TableCell>Site</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWOs.map((workOrder) => {
                const asset = getAssetById(workOrder.assetId);
                const assignee = workOrder.assignedToId ? getUserById(workOrder.assignedToId) : null;
                const site = getSiteById(workOrder.siteId);
                const showSLA = !['resolved', 'closed'].includes(workOrder.status);
                const isBreached = workOrder.slaBreached && showSLA;

                return (
                  <TableRow
                    key={workOrder.id}
                    hover
                    onClick={() => setSelectedWOId(workOrder.id)}
                    sx={{
                      cursor: 'pointer',
                      borderLeft: `4px solid ${isBreached ? '#EF5350' : 'transparent'}`,
                      backgroundColor: isBreached ? alpha('#EF5350', 0.06) : undefined,
                      '&:hover': {
                        backgroundColor: isBreached ? alpha('#EF5350', 0.12) : undefined,
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatWONumber(workOrder.number)}
                        </Typography>
                        {isBreached && (
                          <Chip
                            size="small"
                            label="SLA BREACHED"
                            sx={{
                              backgroundColor: alpha('#EF5350', 0.15),
                              color: '#EF5350',
                              fontWeight: 700,
                              fontSize: '0.63rem',
                              height: 20,
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{asset?.name}</TableCell>
                    <TableCell>{workOrder.faultType}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={workOrder.priority}
                        sx={{
                          backgroundColor: alpha(priorityColors[workOrder.priority], 0.15),
                          color: priorityColors[workOrder.priority],
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={workOrderStatusLabels[workOrder.status]}
                        sx={{
                          backgroundColor: alpha(
                            statusColumns.find((column) => column.id === workOrder.status)?.color || '#666',
                            0.15
                          ),
                          color: statusColumns.find((column) => column.id === workOrder.status)?.color,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <ApprovalStatusChip approvalStatus={getApprovalStatus(workOrder)} />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {showSLA && <SLAChip createdAt={workOrder.createdAt} deadline={workOrder.slaDeadline} now={now} />}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {assignee ? `${assignee.firstName} ${assignee.lastName}` : '-'}
                    </TableCell>
                    <TableCell>{site?.name}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Drawer
        anchor="right"
        open={Boolean(selectedWO)}
        onClose={() => setSelectedWOId(null)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 520 } },
        }}
      >
        {selectedWO && (
          <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const w = selectedWO;
                const html = `<!DOCTYPE html><html><head><title>WO ${w.number}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#222}h1{font-size:20px;border-bottom:2px solid #0A4D8C;padding-bottom:8px}.header{margin-bottom:20px}.field{display:flex;gap:8px;margin-bottom:6px}.label{font-weight:bold;min-width:140px;color:#555}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.sig{margin-top:40px;display:flex;gap:60px}.sig div{border-top:1px solid #333;padding-top:4px;width:200px;text-align:center;font-size:12px;color:#777}@media print{button{display:none}}</style></head><body><div class="header"><h1>Work Order: ${w.number}</h1><p>${w.title}</p></div><div class="field"><span class="label">Status:</span><span>${w.status}</span></div><div class="field"><span class="label">Priority:</span><span>${w.priority}</span></div><div class="field"><span class="label">Assigned To:</span><span>${w.assignedToId || '-'}</span></div><div class="field"><span class="label">Created:</span><span>${w.createdAt}</span></div><div class="field"><span class="label">Description:</span><span>${w.description || '-'}</span></div>${w.checklist && w.checklist.length > 0 ? '<h3>Checklist</h3><table><tr><th>Item</th><th>Done</th></tr>' + w.checklist.map(c => `<tr><td>${c.text}</td><td>${c.completed ? '✅' : '⬜'}</td></tr>`).join('') + '</table>' : ''}${w.comments && w.comments.length > 0 ? '<h3>Comments</h3>' + w.comments.map(c => `<p><strong>${c.userId}:</strong> ${c.message}</p>`).join('') : ''}<div class="sig"><div>Technician Signature</div><div>Supervisor Signature</div><div>Date</div></div><button onclick="window.print()" style="margin-top:20px;padding:8px 16px;cursor:pointer">Print / Save as PDF</button></body></html>`;
                const w2 = window.open('', '_blank');
                if (w2) { w2.document.write(html); w2.document.close(); }
              }}
            >
              Print WO
            </Button>
          </Box>
          <WODetailPanel
            wo={selectedWO}
            permit={permits.find((permit) => permit.workOrderId === selectedWO.id) || null}
            now={now}
            onClose={() => setSelectedWOId(null)}
            onCreatePermit={() => {
              const selectedAsset = getAssetById(selectedWO.assetId);
              createPermit({
                workOrderId: selectedWO.id,
                type: 'general',
                riskLevel:
                  selectedWO.priority === 'P1'
                    ? 'high'
                    : selectedWO.priority === 'P2'
                      ? 'medium'
                      : 'low',
                location:
                  [selectedAsset?.floor, selectedAsset?.zone].filter(Boolean).join(' • ') ||
                  selectedAsset?.name ||
                  'Work Area',
              });
            }}
            onToggleChecklist={(checklistItemId) => toggleChecklistItem(selectedWO.id, checklistItemId)}
            onAddComment={(message) => addWorkOrderComment(selectedWO.id, message)}
            onAddLabourEntry={(entry) => addLabourEntry(selectedWO.id, entry)}
            onAddPartsEntry={(entry) => addPartsEntry(selectedWO.id, entry)}
            onUpdateStatus={(status, comment) =>
              updateWorkOrderStatus({ workOrderId: selectedWO.id, status, comment })
            }
            onApproveWorkOrder={(level, comment) =>
              approveWorkOrder(selectedWO.id, level, currentApprovalUser.id, currentApprovalUser.name, comment)
            }
            onRejectWorkOrder={(level, comment) =>
              rejectWorkOrder(selectedWO.id, level, currentApprovalUser.id, currentApprovalUser.name, comment)
            }
            onSaveRCA={(rootCause, failureMode, correctiveAction) =>
              saveRCA(selectedWO.id, rootCause, failureMode, correctiveAction)
            }
          />
          </>
        )}
      </Drawer>

      <CreateWODialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateWorkOrder}
      />

      <Snackbar
        open={showCreatedSnackbar}
        autoHideDuration={3500}
        onClose={() => setShowCreatedSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setShowCreatedSnackbar(false)}>
          Work order created successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
}

function SLAChip({ createdAt, deadline, now }: { createdAt: string; deadline: string; now: Date }) {
  const { timeLeft, isOverdue } = getSLAState(createdAt, deadline, now);
  return (
    <Chip
      size="small"
      icon={<TimeIcon sx={{ fontSize: 12 }} />}
      label={timeLeft}
      sx={{
        backgroundColor: isOverdue ? alpha('#EF5350', 0.1) : alpha('#66BB6A', 0.1),
        color: isOverdue ? '#EF5350' : '#66BB6A',
        fontWeight: 600,
        fontSize: '0.7rem',
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  );
}

function EscalationMethodIcon({ method }: { method: 'system' | 'email' | 'sms' }) {
  if (method === 'email') {
    return <EmailIcon sx={{ fontSize: 16 }} />;
  }
  if (method === 'sms') {
    return <SmsIcon sx={{ fontSize: 16 }} />;
  }
  return <SystemIcon sx={{ fontSize: 16 }} />;
}

function WODetailPanel({
  wo,
  permit,
  now,
  onClose,
  onCreatePermit,
  onToggleChecklist,
  onAddComment,
  onAddLabourEntry,
  onAddPartsEntry,
  onUpdateStatus,
  onApproveWorkOrder,
  onRejectWorkOrder,
  onSaveRCA,
}: {
  wo: WorkOrder;
  permit: Permit | null;
  now: Date;
  onClose: () => void;
  onCreatePermit: () => void;
  onToggleChecklist: (checklistItemId: string) => void;
  onAddComment: (message: string) => void;
  onAddLabourEntry: (entry: {
    technicianId: string;
    technicianName: string;
    hours: number;
    ratePerHour: number;
    date?: string;
    description?: string;
  }) => void;
  onAddPartsEntry: (entry: {
    inventoryItemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    date?: string;
  }) => void;
  onUpdateStatus: (status: WorkOrderStatus, comment?: string) => void;
  onApproveWorkOrder: (level: 1 | 2, comment?: string) => void;
  onRejectWorkOrder: (level: 1 | 2, comment: string) => void;
  onSaveRCA: (rootCause: RootCause, failureMode: string, correctiveAction: string) => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<WorkOrderStatus | ''>('');
  const [statusComment, setStatusComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [labourTechnicianId, setLabourTechnicianId] = useState('');
  const [labourHours, setLabourHours] = useState('');
  const [labourRatePerHour, setLabourRatePerHour] = useState('');
  const [labourDescription, setLabourDescription] = useState('');
  const [labourDate, setLabourDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [partItemId, setPartItemId] = useState('');
  const [partQuantity, setPartQuantity] = useState('');
  const [partUnitCost, setPartUnitCost] = useState('');
  const [partDate, setPartDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalError, setApprovalError] = useState('');
  const [rcaEditMode, setRcaEditMode] = useState(false);
  const [rootCauseDraft, setRootCauseDraft] = useState<RootCause | ''>('');
  const [failureModeDraft, setFailureModeDraft] = useState('');
  const [correctiveActionDraft, setCorrectiveActionDraft] = useState('');
  const asset = getAssetById(wo.assetId);
  const reportedBy = wo.reportedById ? getUserById(wo.reportedById) : null;
  const site = getSiteById(wo.siteId);
  const statusColor = statusColumns.find((column) => column.id === wo.status)?.color || '#666';
  const { progress, isOverdue, timeLeft } = getSLAState(wo.createdAt, wo.slaDeadline, now);
  const availableNextStatuses = nextStatusMap[wo.status] || [];
  const availableTechnicians = useMemo(
    () => technicians.filter((technician) => technician.siteIds.includes(wo.siteId)),
    [wo.siteId]
  );
  const availableParts = useMemo(() => {
    const items = inventoryItems.filter((item) => item.siteId === wo.siteId);
    return items.length > 0 ? items : inventoryItems;
  }, [wo.siteId]);
  const labourEntries = [...(wo.labourEntries || [])].sort(
    (entryA, entryB) => new Date(entryB.date).getTime() - new Date(entryA.date).getTime()
  );
  const partsEntries = [...(wo.partsUsed || [])].sort(
    (entryA, entryB) => new Date(entryB.date).getTime() - new Date(entryA.date).getTime()
  );
  const totalLabourCost = wo.totalLabourCost || 0;
  const totalPartsCost = wo.totalPartsCost || 0;
  const grandTotalCost = wo.totalCost || totalLabourCost + totalPartsCost;
  const approvalStatus = getApprovalStatus(wo);
  const approvalChain = getApprovalChain(wo).sort((entryA, entryB) => entryA.level - entryB.level);
  const pendingApprovalLevel =
    approvalStatus === 'pending_supervisor' ? 1 : approvalStatus === 'pending_manager' ? 2 : null;
  const activeApprovalStep = (() => {
    if (approvalStatus === 'pending_supervisor') return 0;
    if (approvalStatus === 'pending_manager') return 1;
    if (approvalStatus === 'rejected') {
      const rejectedIndex = approvalChain.findIndex((step) => step.action === 'rejected');
      return rejectedIndex >= 0 ? rejectedIndex : 0;
    }
    if (approvalStatus === 'approved') return approvalChain.length;
    return -1;
  })();
  const isCompletedOrClosed = ['resolved', 'closed'].includes(wo.status);
  const hasRCA = Boolean(wo.rootCause && wo.failureMode?.trim() && wo.correctiveAction?.trim());

  useEffect(() => {
    const workOrderHasRCA = Boolean(wo.rootCause && wo.failureMode?.trim() && wo.correctiveAction?.trim());

    setActiveTab(0);
    setStatusComment('');
    setNewComment('');
    setApprovalComment('');
    setApprovalError('');
    setNextStatus(availableNextStatuses[0] || '');
    setLabourTechnicianId(wo.assignedToId || availableTechnicians[0]?.id || '');
    setLabourHours('');
    setLabourRatePerHour('');
    setLabourDescription('');
    setLabourDate(toDateInputValue(wo.updatedAt));

    const defaultPart = availableParts[0];
    setPartItemId(defaultPart?.id || '');
    setPartQuantity('');
    setPartUnitCost(defaultPart?.unitCost ? String(defaultPart.unitCost) : '');
    setPartDate(toDateInputValue(wo.updatedAt));
    setRootCauseDraft(wo.rootCause || '');
    setFailureModeDraft(wo.failureMode || '');
    setCorrectiveActionDraft(wo.correctiveAction || '');
    setRcaEditMode(!workOrderHasRCA);
  }, [wo.id, availableNextStatuses]);

  const handleSaveStatusUpdate = () => {
    if (!nextStatus) return;
    onUpdateStatus(nextStatus, statusComment);
    setUpdateStatusOpen(false);
    setStatusComment('');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const handleApprove = () => {
    if (!pendingApprovalLevel) return;

    onApproveWorkOrder(pendingApprovalLevel, approvalComment.trim() || undefined);
    setApprovalComment('');
    setApprovalError('');
  };

  const handleReject = () => {
    if (!pendingApprovalLevel) return;

    const trimmedComment = approvalComment.trim();
    if (!trimmedComment) {
      setApprovalError('Rejection comment is required.');
      return;
    }

    onRejectWorkOrder(pendingApprovalLevel, trimmedComment);
    setApprovalComment('');
    setApprovalError('');
  };

  const handleSaveRCA = () => {
    if (!rootCauseDraft || !failureModeDraft.trim() || !correctiveActionDraft.trim()) {
      return;
    }

    onSaveRCA(rootCauseDraft, failureModeDraft, correctiveActionDraft);
    setRcaEditMode(false);
  };

  const timelineEntries = [...(wo.timeline || [])].sort(
    (entryA, entryB) => new Date(entryA.createdAt).getTime() - new Date(entryB.createdAt).getTime()
  );

  const handlePartSelectionChange = (inventoryItemId: string) => {
    setPartItemId(inventoryItemId);
    const selectedPart = availableParts.find((item) => item.id === inventoryItemId);
    if (selectedPart?.unitCost) {
      setPartUnitCost(String(selectedPart.unitCost));
    }
  };

  const handleAddLabour = () => {
    const selectedTechnician = availableTechnicians.find((technician) => technician.id === labourTechnicianId);
    const parsedHours = Number(labourHours);
    const parsedRatePerHour = Number(labourRatePerHour);

    if (!selectedTechnician || parsedHours <= 0 || parsedRatePerHour <= 0 || !labourDate) {
      return;
    }

    onAddLabourEntry({
      technicianId: selectedTechnician.id,
      technicianName: `${selectedTechnician.firstName} ${selectedTechnician.lastName}`,
      hours: parsedHours,
      ratePerHour: parsedRatePerHour,
      date: new Date(`${labourDate}T08:00:00`).toISOString(),
      description: labourDescription.trim() || undefined,
    });

    setLabourHours('');
    setLabourRatePerHour('');
    setLabourDescription('');
  };

  const handleAddPart = () => {
    const selectedPart = availableParts.find((part) => part.id === partItemId);
    const parsedQuantity = Number(partQuantity);
    const parsedUnitCost = Number(partUnitCost);

    if (!selectedPart || parsedQuantity <= 0 || parsedUnitCost <= 0 || !partDate) {
      return;
    }

    onAddPartsEntry({
      inventoryItemId: selectedPart.id,
      itemName: selectedPart.name,
      quantity: parsedQuantity,
      unitCost: parsedUnitCost,
      date: new Date(`${partDate}T08:00:00`).toISOString(),
    });

    setPartQuantity('');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {formatWONumber(wo.number)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
            <Chip
              size="small"
              label={wo.priority}
              sx={{
                backgroundColor: alpha(priorityColors[wo.priority], 0.15),
                color: priorityColors[wo.priority],
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label={workOrderStatusLabels[wo.status]}
              sx={{
                backgroundColor: alpha(statusColor, 0.15),
                color: statusColor,
              }}
            />
            <ApprovalStatusChip approvalStatus={approvalStatus} />
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Asset Information
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Asset
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {asset?.name || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Site
              </Typography>
              <Typography variant="body2">{site?.name || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body2">
                {[asset?.floor, asset?.zone].filter(Boolean).join(' • ') || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Last Service
              </Typography>
              <Typography variant="body2">
                {asset?.lastServiceDate ? format(new Date(asset.lastServiceDate), 'MMM d, yyyy') : '-'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Details
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Fault Type
              </Typography>
              <Typography variant="body2">{wo.faultType}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Reported By
              </Typography>
              <Typography variant="body2">
                {reportedBy ? `${reportedBy.firstName} ${reportedBy.lastName}` : 'Dispatch Desk'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body2">{wo.description}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">{format(new Date(wo.createdAt), 'MMM d, yyyy HH:mm')}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Estimated Hours
              </Typography>
              <Typography variant="body2">{wo.estimatedHours ? `${wo.estimatedHours}h` : '-'}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            SLA Tracker
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 10,
              backgroundColor: alpha(isOverdue ? '#EF5350' : '#29B6F6', 0.2),
              '& .MuiLinearProgress-bar': {
                borderRadius: 10,
                backgroundColor: isOverdue ? '#EF5350' : '#29B6F6',
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Started {format(new Date(wo.createdAt), 'MMM d, HH:mm')}
            </Typography>
            <Typography variant="caption" color={isOverdue ? 'error.main' : 'success.main'} fontWeight={700}>
              {isOverdue ? `Breached (${timeLeft})` : `${timeLeft} remaining`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Due {format(new Date(wo.slaDeadline), 'MMM d, HH:mm')}
            </Typography>
          </Box>
        </Box>

        <AssetMiniMap assetId={wo.assetId} />

        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ mt: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab label="Timeline" />
          <Tab label="Checklist" />
          <Tab label="Updates" />
          <Tab label="Costs" />
          <Tab label="Permit" />
          <Tab label="RCA" />
          <Tab label="Approvals" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ mt: 1 }}>
            <List dense>
              {timelineEntries.map((entry) => {
                const user = getUserById(entry.userId);

                return (
                  <ListItem key={entry.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {entry.description}
                        </Typography>
                      }
                      secondary={`${user ? `${user.firstName} ${user.lastName}` : 'System'} • ${format(new Date(entry.createdAt), 'MMM d, HH:mm')}`}
                    />
                  </ListItem>
                );
              })}
            </List>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1.5, mb: 0.5 }}>
              Escalation Log
            </Typography>
            <List dense>
              {wo.escalationLog.length === 0 && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        No escalation entries
                      </Typography>
                    }
                  />
                </ListItem>
              )}
              {wo.escalationLog.map((entry, index) => (
                <ListItem key={`${entry.timestamp}-${index}`} sx={{ px: 0 }}>
                  <ListItemAvatar sx={{ minWidth: 30, color: 'error.main' }}>
                    <EscalationMethodIcon method={entry.method} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {entry.notifiedRole} • {entry.notifiedName}
                      </Typography>
                    }
                    secondary={`${entry.method.toUpperCase()} • ${format(new Date(entry.timestamp), 'MMM d, HH:mm')}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {activeTab === 1 && (
          <List dense sx={{ mt: 1 }}>
            {(wo.checklist || []).map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  px: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Checkbox checked={item.completed} onChange={() => onToggleChecklist(item.id)} />
                {item.completed ? <CheckIcon color="success" fontSize="small" /> : <CircleIcon fontSize="small" />}
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {item.text}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}

        {activeTab === 2 && (
          <Box sx={{ mt: 1 }}>
            <List dense>
              {(wo.comments || []).map((comment) => {
                const user = getUserById(comment.userId);
                return (
                  <ListItem key={comment.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {user ? `${user.firstName} ${user.lastName}` : 'System'}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {comment.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'flex-end' }}>
              <TextField
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                placeholder="Add update..."
                fullWidth
                multiline
                minRows={2}
              />
              <IconButton color="primary" onClick={handleAddComment}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Labour Entries
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Technician</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Rate (RM/hr)</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labourEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{entry.technicianName}</TableCell>
                      <TableCell align="right">{entry.hours.toFixed(1)}</TableCell>
                      <TableCell align="right">{formatRM(entry.ratePerHour)}</TableCell>
                      <TableCell align="right">{formatRM(entry.hours * entry.ratePerHour)}</TableCell>
                      <TableCell>{entry.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {labourEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          No labour entries recorded yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
              Add Labour
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', mb: 2 }}>
              <FormControl size="small" sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                <InputLabel>Technician</InputLabel>
                <Select
                  value={labourTechnicianId}
                  label="Technician"
                  onChange={(event) => setLabourTechnicianId(event.target.value)}
                >
                  {availableTechnicians.map((technician) => (
                    <MenuItem key={technician.id} value={technician.id}>
                      {technician.firstName} {technician.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="number"
                label="Hours"
                value={labourHours}
                onChange={(event) => setLabourHours(event.target.value)}
                sx={{ gridColumn: { xs: 'span 6', sm: 'span 2' } }}
              />
              <TextField
                size="small"
                type="number"
                label="Rate (RM/hr)"
                value={labourRatePerHour}
                onChange={(event) => setLabourRatePerHour(event.target.value)}
                sx={{ gridColumn: { xs: 'span 6', sm: 'span 2' } }}
              />
              <TextField
                size="small"
                type="date"
                label="Date"
                value={labourDate}
                onChange={(event) => setLabourDate(event.target.value)}
                sx={{ gridColumn: { xs: 'span 12', sm: 'span 2' } }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleAddLabour}
                sx={{ gridColumn: { xs: 'span 12', sm: 'span 2' } }}
              >
                Add Labour
              </Button>
              <TextField
                size="small"
                label="Description"
                value={labourDescription}
                onChange={(event) => setLabourDescription(event.target.value)}
                sx={{ gridColumn: 'span 12' }}
              />
            </Box>

            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Parts Used
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partsEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{entry.itemName}</TableCell>
                      <TableCell align="right">{entry.quantity}</TableCell>
                      <TableCell align="right">{formatRM(entry.unitCost)}</TableCell>
                      <TableCell align="right">{formatRM(entry.quantity * entry.unitCost)}</TableCell>
                    </TableRow>
                  ))}
                  {partsEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          No parts usage recorded yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
              Add Part
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', mb: 2.5 }}>
              <FormControl size="small" sx={{ gridColumn: { xs: 'span 12', sm: 'span 5' } }}>
                <InputLabel>Inventory Item</InputLabel>
                <Select
                  value={partItemId}
                  label="Inventory Item"
                  onChange={(event) => handlePartSelectionChange(event.target.value)}
                >
                  {availableParts.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="number"
                label="Quantity"
                value={partQuantity}
                onChange={(event) => setPartQuantity(event.target.value)}
                sx={{ gridColumn: { xs: 'span 6', sm: 'span 2' } }}
              />
              <TextField
                size="small"
                type="number"
                label="Unit Cost (RM)"
                value={partUnitCost}
                onChange={(event) => setPartUnitCost(event.target.value)}
                sx={{ gridColumn: { xs: 'span 6', sm: 'span 2' } }}
              />
              <TextField
                size="small"
                type="date"
                label="Date"
                value={partDate}
                onChange={(event) => setPartDate(event.target.value)}
                sx={{ gridColumn: { xs: 'span 12', sm: 'span 2' } }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleAddPart}
                sx={{ gridColumn: { xs: 'span 12', sm: 'span 1' } }}
              >
                Add
              </Button>
            </Box>

            <Card variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Cost Summary (RM)
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Labour Cost
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatRM(totalLabourCost)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Parts Cost
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatRM(totalPartsCost)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight={700}>
                    Grand Total
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="primary.main">
                    {formatRM(grandTotalCost)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 4 && (
          <Box sx={{ mt: 1.5 }}>
            {permit ? (
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {permit.permitNumber}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={permitTypeLabels[permit.type]}
                    sx={{
                      backgroundColor: alpha('#00BCD4', 0.15),
                      color: 'primary.main',
                    }}
                  />
                  <Chip
                    size="small"
                    label={permitStatusLabels[permit.status]}
                    sx={{
                      backgroundColor: alpha(permitStatusColors[permit.status], 0.15),
                      color: permitStatusColors[permit.status],
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Location: {permit.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valid: {format(new Date(permit.validFrom), 'MMM d, HH:mm')} -{' '}
                  {format(new Date(permit.validTo), 'MMM d, HH:mm')}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No linked permit for this work order.
                </Typography>
                <Button variant="contained" onClick={onCreatePermit}>
                  Create Permit
                </Button>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 5 && (
          <Box sx={{ mt: 1 }}>
            {!rcaEditMode && hasRCA ? (
              <Box>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Root Cause
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {wo.rootCause ? rootCauseLabelByValue[wo.rootCause] : '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Failure Mode
                    </Typography>
                    <Typography variant="body2">{wo.failureMode || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Corrective Action
                    </Typography>
                    <Typography variant="body2">{wo.correctiveAction || '-'}</Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={() => setRcaEditMode(true)}>
                    Edit RCA
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <FormControl fullWidth>
                  <InputLabel>Root Cause</InputLabel>
                  <Select
                    value={rootCauseDraft}
                    label="Root Cause"
                    onChange={(event: SelectChangeEvent<RootCause | ''>) =>
                      setRootCauseDraft(event.target.value as RootCause | '')
                    }
                  >
                    {rootCauseOptions.map((rootCauseOption) => (
                      <MenuItem key={rootCauseOption.value} value={rootCauseOption.value}>
                        {rootCauseOption.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Failure Mode"
                  value={failureModeDraft}
                  onChange={(event) => setFailureModeDraft(event.target.value)}
                  placeholder="e.g. Condenser airflow restriction"
                  fullWidth
                />
                <TextField
                  label="Corrective Action"
                  value={correctiveActionDraft}
                  onChange={(event) => setCorrectiveActionDraft(event.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveRCA}
                    disabled={!rootCauseDraft || !failureModeDraft.trim() || !correctiveActionDraft.trim()}
                  >
                    Save RCA
                  </Button>
                  {hasRCA && (
                    <Button
                      variant="text"
                      onClick={() => {
                        setRootCauseDraft(wo.rootCause || '');
                        setFailureModeDraft(wo.failureMode || '');
                        setCorrectiveActionDraft(wo.correctiveAction || '');
                        setRcaEditMode(false);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 6 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Current approver: {currentApprovalUser.name} ({currentApprovalUser.role})
            </Typography>
            <Stepper activeStep={activeApprovalStep} orientation="vertical">
              {approvalChain.map((step) => {
                const stepStatus = step.action
                  ? `${step.action === 'approved' ? 'Approved' : 'Rejected'} by ${step.approverName || step.role}`
                  : 'Pending action';

                return (
                  <Step key={step.level} completed={step.action === 'approved'}>
                    <StepLabel error={step.action === 'rejected'}>
                      {`Level ${step.level} • ${step.role}`}
                    </StepLabel>
                    <Box sx={{ pl: 1, pb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {stepStatus}
                      </Typography>
                      {step.comment && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {step.comment}
                        </Typography>
                      )}
                      {step.timestamp && (
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                          {format(new Date(step.timestamp), 'MMM d, yyyy HH:mm')}
                        </Typography>
                      )}
                    </Box>
                  </Step>
                );
              })}
            </Stepper>

            {pendingApprovalLevel && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Approval Comment"
                  value={approvalComment}
                  onChange={(event) => {
                    setApprovalComment(event.target.value);
                    if (approvalError) {
                      setApprovalError('');
                    }
                  }}
                  error={Boolean(approvalError)}
                  helperText={approvalError || 'Comment is optional for approve and required for reject.'}
                />
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                  <Button variant="contained" color="success" onClick={handleApprove}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" onClick={handleReject}>
                    Reject
                  </Button>
                </Box>
              </Box>
            )}

            {!pendingApprovalLevel && (
              <Alert severity={approvalStatus === 'approved' ? 'success' : approvalStatus === 'rejected' ? 'error' : 'info'} sx={{ mt: 2 }}>
                This work order is currently <strong>{approvalStatusLabels[approvalStatus].toLowerCase()}</strong>.
              </Alert>
            )}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button variant="outlined" onClick={() => setUpdateStatusOpen(true)} disabled={availableNextStatuses.length === 0}>
          Update Status
        </Button>
        {wo.status === 'resolved' && (
          <Button
            variant="contained"
            color="success"
            onClick={() => onUpdateStatus('closed', 'Work order closed after verification.')}
          >
            Close WO
          </Button>
        )}
      </Box>

      <Dialog open={updateStatusOpen} onClose={() => setUpdateStatusOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Work Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Next Status</InputLabel>
            <Select
              value={nextStatus}
              label="Next Status"
              onChange={(event: SelectChangeEvent<WorkOrderStatus | ''>) =>
                setNextStatus(event.target.value as WorkOrderStatus | '')
              }
            >
              {availableNextStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {workOrderStatusLabels[status]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Comment"
            value={statusComment}
            onChange={(event) => setStatusComment(event.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateStatusOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStatusUpdate} disabled={!nextStatus}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function AssetMiniMap({ assetId }: { assetId: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const asset = getAssetById(assetId);

  useEffect(() => {
    if (!asset || !mapContainerRef.current || mapRef.current) {
      return;
    }

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [asset.location.lng, asset.location.lat],
      zoom: 16,
    });

    markerRef.current = new maplibregl.Marker({ color: '#EF5350' })
      .setLngLat([asset.location.lng, asset.location.lat])
      .addTo(mapRef.current);

    return () => {
      markerRef.current?.remove();
      mapRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [asset]);

  if (!asset) {
    return (
      <Box
        sx={{
          height: 200,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No asset map available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Asset Location
      </Typography>
      <Box ref={mapContainerRef} sx={{ height: 200, borderRadius: 2, overflow: 'hidden' }} />
    </Box>
  );
}

function CreateWODialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateWorkOrderFormData) => void;
}) {
  const [asset, setAsset] = useState<(typeof assets)[number] | null>(null);
  const [faultType, setFaultType] = useState<(typeof workOrderFaultTypes)[number] | ''>('');
  const [priority, setPriority] = useState<Priority>('P3');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  useEffect(() => {
    if (!open) {
      setAsset(null);
      setFaultType('');
      setPriority('P3');
      setDescription('');
      setAssignedToId('');
      setEstimatedHours('');
    }
  }, [open]);

  const isValid = asset && faultType && description.trim().length > 3;

  const handleCreate = () => {
    if (!asset || !faultType) return;

    onSubmit({
      assetId: asset.id,
      faultType,
      description: description.trim(),
      priority,
      assignedToId: assignedToId || undefined,
      estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Work Order</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              options={assets}
              value={asset}
              onChange={(_, value) => setAsset(value)}
              getOptionLabel={(option) => `${option.name} • ${option.type}`}
              renderInput={(params) => <TextField {...params} label="Asset" placeholder="Search asset" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Fault Type</InputLabel>
              <Select
                value={faultType}
                label="Fault Type"
                onChange={(event) => setFaultType(event.target.value as (typeof workOrderFaultTypes)[number])}
              >
                {workOrderFaultTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(event) => setPriority(event.target.value as Priority)}
                renderValue={(value) => (
                  <Chip
                    label={`${value} • ${prioritySLAHours[value]}h SLA`}
                    size="small"
                    sx={{
                      backgroundColor: alpha(priorityColors[value], 0.15),
                      color: priorityColors[value],
                      fontWeight: 700,
                    }}
                  />
                )}
              >
                {(Object.keys(priorityColors) as Priority[]).map((priorityValue) => (
                  <MenuItem key={priorityValue} value={priorityValue}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip
                        label={priorityValue}
                        size="small"
                        sx={{
                          backgroundColor: alpha(priorityColors[priorityValue], 0.15),
                          color: priorityColors[priorityValue],
                          fontWeight: 700,
                        }}
                      />
                      <Typography variant="body2">{prioritySLAHours[priorityValue]}h SLA</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 7 }}>
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                value={assignedToId}
                label="Assign To"
                onChange={(event) => setAssignedToId(event.target.value)}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {technicians.map((technician) => (
                  <MenuItem key={technician.id} value={technician.id}>
                    {technician.firstName} {technician.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth
              type="number"
              label="Estimated Hours"
              value={estimatedHours}
              onChange={(event) => setEstimatedHours(event.target.value)}
              inputProps={{ min: 0, step: 0.5 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={!isValid}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
