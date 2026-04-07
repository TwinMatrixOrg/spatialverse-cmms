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
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
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
  Search as SearchIcon,
  Send as SendIcon,
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
  technicians,
  WorkOrder,
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

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        borderLeft: `4px solid ${priorityColors[wo.priority]}`,
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {formatWONumber(wo.number)}
          </Typography>
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
          {asset?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {wo.faultType}
        </Typography>
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
        width: 280,
        minWidth: 280,
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
    updateWorkOrderStatus,
    createWorkOrder,
    toggleChecklistItem,
    addWorkOrderComment,
    addLabourEntry,
    addPartsEntry,
  } =
    useStore();
  const location = useLocation();
  const now = useMinuteTicker();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
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

  const filteredWOs = useMemo(() => {
    return workOrders.filter((workOrder) => {
      if (selectedSiteId && workOrder.siteId !== selectedSiteId) return false;
      if (priorityFilter !== 'all' && workOrder.priority !== priorityFilter) return false;
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
  }, [priorityFilter, searchQuery, selectedSiteId, workOrders]);

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
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Work Orders
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
          Create Work Order
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search work orders..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
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
        <Chip label={`${filteredWOs.length} work orders`} sx={{ alignSelf: 'center' }} />
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
        >
          <ToggleButton value="kanban">
            <KanbanIcon sx={{ mr: 0.5 }} /> Kanban
          </ToggleButton>
          <ToggleButton value="list">
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
          <Box sx={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', pb: 2 }}>
            {statusColumns.map((column) => (
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
        <TableContainer component={Paper} sx={{ flex: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>WO #</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Fault Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>SLA</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Site</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWOs.map((workOrder) => {
                const asset = getAssetById(workOrder.assetId);
                const assignee = workOrder.assignedToId ? getUserById(workOrder.assignedToId) : null;
                const site = getSiteById(workOrder.siteId);
                const showSLA = !['resolved', 'closed'].includes(workOrder.status);

                return (
                  <TableRow
                    key={workOrder.id}
                    hover
                    onClick={() => setSelectedWOId(workOrder.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatWONumber(workOrder.number)}
                      </Typography>
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
                    <TableCell>{showSLA && <SLAChip createdAt={workOrder.createdAt} deadline={workOrder.slaDeadline} now={now} />}</TableCell>
                    <TableCell>{assignee ? `${assignee.firstName} ${assignee.lastName}` : '-'}</TableCell>
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
          <WODetailPanel
            wo={selectedWO}
            now={now}
            onClose={() => setSelectedWOId(null)}
            onToggleChecklist={(checklistItemId) => toggleChecklistItem(selectedWO.id, checklistItemId)}
            onAddComment={(message) => addWorkOrderComment(selectedWO.id, message)}
            onAddLabourEntry={(entry) => addLabourEntry(selectedWO.id, entry)}
            onAddPartsEntry={(entry) => addPartsEntry(selectedWO.id, entry)}
            onUpdateStatus={(status, comment) =>
              updateWorkOrderStatus({ workOrderId: selectedWO.id, status, comment })
            }
          />
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

function WODetailPanel({
  wo,
  now,
  onClose,
  onToggleChecklist,
  onAddComment,
  onAddLabourEntry,
  onAddPartsEntry,
  onUpdateStatus,
}: {
  wo: WorkOrder;
  now: Date;
  onClose: () => void;
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

  useEffect(() => {
    setActiveTab(0);
    setStatusComment('');
    setNewComment('');
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
        </Tabs>

        {activeTab === 0 && (
          <List dense sx={{ mt: 1 }}>
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
