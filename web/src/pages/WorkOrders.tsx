import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ViewKanban as KanbanIcon,
  ViewList as ListIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  CheckCircle as CheckIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../store/useStore';
import {
  workOrders,
  assets,
  users,
  contractors,
  sites,
  getAssetById,
  getUserById,
  getSiteById,
  WorkOrder,
  WorkOrderStatus,
  Priority,
} from '../data/mockData';
import { format, formatDistanceToNow } from 'date-fns';

const statusColumns: { id: WorkOrderStatus; label: string; color: string }[] = [
  { id: 'open', label: 'Open', color: '#29B6F6' },
  { id: 'assigned', label: 'Assigned', color: '#AB47BC' },
  { id: 'in_progress', label: 'In Progress', color: '#FFA726' },
  { id: 'pending_parts', label: 'Pending Parts', color: '#78909C' },
  { id: 'resolved', label: 'Resolved', color: '#66BB6A' },
  { id: 'closed', label: 'Closed', color: '#90A4AE' },
];

const priorityColors = {
  P1: '#EF5350',
  P2: '#FFA726',
  P3: '#FFEE58',
  P4: '#66BB6A',
};

function useSLACountdown(deadline: string) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setIsOverdue(true);
        const overdue = Math.abs(diff);
        const hours = Math.floor(overdue / (1000 * 60 * 60));
        const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`-${hours}h ${minutes}m`);
      } else {
        setIsOverdue(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return { timeLeft, isOverdue };
}

function WOCard({ wo, onClick }: { wo: WorkOrder; onClick: () => void }) {
  const theme = useTheme();
  const asset = getAssetById(wo.assetId);
  const assignee = wo.assignedToId ? getUserById(wo.assignedToId) : null;
  const { timeLeft, isOverdue } = useSLACountdown(wo.slaDeadline);
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
            {wo.number}
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
          {showSLA && (
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
          )}
          {!showSLA && <Box />}
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

function SortableWOCard({ wo, onClick }: { wo: WorkOrder; onClick: () => void }) {
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
      <WOCard wo={wo} onClick={onClick} />
    </div>
  );
}

function KanbanColumn({
  column,
  wos,
  onCardClick,
}: {
  column: typeof statusColumns[0];
  wos: WorkOrder[];
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          px: 1,
        }}
      >
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
        <SortableContext items={wos.map(w => w.id)} strategy={verticalListSortingStrategy}>
          {wos.map(wo => (
            <SortableWOCard key={wo.id} wo={wo} onClick={() => onCardClick(wo)} />
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
  const theme = useTheme();
  const { selectedSiteId } = useStore();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [localWorkOrders, setLocalWorkOrders] = useState(workOrders);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredWOs = useMemo(() => {
    return localWorkOrders.filter(wo => {
      if (selectedSiteId && wo.siteId !== selectedSiteId) return false;
      if (priorityFilter !== 'all' && wo.priority !== priorityFilter) return false;
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const asset = getAssetById(wo.assetId);
        return (
          wo.number.toLowerCase().includes(search) ||
          wo.title.toLowerCase().includes(search) ||
          asset?.name.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [localWorkOrders, selectedSiteId, priorityFilter, searchQuery]);

  const wosByStatus = useMemo(() => {
    const grouped: Record<WorkOrderStatus, WorkOrder[]> = {
      open: [],
      assigned: [],
      in_progress: [],
      pending_parts: [],
      resolved: [],
      closed: [],
    };
    filteredWOs.forEach(wo => {
      grouped[wo.status].push(wo);
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

    const activeWO = localWorkOrders.find(wo => wo.id === active.id);
    if (!activeWO) return;

    // Find which column the item was dropped on
    const overWO = localWorkOrders.find(wo => wo.id === over.id);
    if (overWO && overWO.status !== activeWO.status) {
      setLocalWorkOrders(prev =>
        prev.map(wo =>
          wo.id === active.id ? { ...wo, status: overWO.status } : wo
        )
      );
    }
  };

  const activeWO = activeId ? localWorkOrders.find(wo => wo.id === activeId) : null;

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Work Order
        </Button>
      </Box>

      {/* Filters */}
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
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="P1">P1 - Critical</MenuItem>
            <MenuItem value="P2">P2 - High</MenuItem>
            <MenuItem value="P3">P3 - Medium</MenuItem>
            <MenuItem value="P4">P4 - Low</MenuItem>
          </Select>
        </FormControl>
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

      {/* Kanban View */}
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
                onCardClick={setSelectedWO}
              />
            ))}
          </Box>
          <DragOverlay>
            {activeWO && <WOCard wo={activeWO} onClick={() => {}} />}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
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
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>SLA</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Assignee</TableCell>
                <TableCell>Site</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWOs.map(wo => {
                const asset = getAssetById(wo.assetId);
                const assignee = wo.assignedToId ? getUserById(wo.assignedToId) : null;
                const site = getSiteById(wo.siteId);
                const showSLA = !['resolved', 'closed'].includes(wo.status);

                return (
                  <TableRow
                    key={wo.id}
                    hover
                    onClick={() => setSelectedWO(wo)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {wo.number}
                      </Typography>
                    </TableCell>
                    <TableCell>{asset?.name}</TableCell>
                    <TableCell>{wo.faultType}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={wo.priority}
                        sx={{
                          backgroundColor: alpha(priorityColors[wo.priority], 0.15),
                          color: priorityColors[wo.priority],
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={wo.status.replace('_', ' ')}
                        sx={{
                          textTransform: 'capitalize',
                          backgroundColor: alpha(
                            statusColumns.find(c => c.id === wo.status)?.color || '#666',
                            0.15
                          ),
                          color: statusColumns.find(c => c.id === wo.status)?.color,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {showSLA && <SLAChip deadline={wo.slaDeadline} />}
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

      {/* Work Order Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedWO)}
        onClose={() => setSelectedWO(null)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 480 } },
        }}
      >
        {selectedWO && <WODetailPanel wo={selectedWO} onClose={() => setSelectedWO(null)} />}
      </Drawer>

      {/* Create Dialog */}
      <CreateWODialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
    </Box>
  );
}

function SLAChip({ deadline }: { deadline: string }) {
  const { timeLeft, isOverdue } = useSLACountdown(deadline);
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

function WODetailPanel({ wo, onClose }: { wo: WorkOrder; onClose: () => void }) {
  const theme = useTheme();
  const asset = getAssetById(wo.assetId);
  const assignee = wo.assignedToId ? getUserById(wo.assignedToId) : null;
  const site = getSiteById(wo.siteId);
  const statusColor = statusColumns.find(c => c.id === wo.status)?.color || '#666';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {wo.number}
          </Typography>
          <Chip
            size="small"
            label={wo.status.replace('_', ' ')}
            sx={{
              mt: 0.5,
              textTransform: 'capitalize',
              backgroundColor: alpha(statusColor, 0.15),
              color: statusColor,
            }}
          />
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {wo.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {wo.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Priority
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                size="small"
                label={wo.priority}
                sx={{
                  backgroundColor: alpha(priorityColors[wo.priority], 0.15),
                  color: priorityColors[wo.priority],
                  fontWeight: 700,
                }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Fault Type
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {wo.faultType}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Asset
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {asset?.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Site
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {site?.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Assigned To
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {format(new Date(wo.createdAt), 'MMM d, yyyy HH:mm')}
            </Typography>
          </Grid>
        </Grid>

        {/* Checklist */}
        {wo.checklist && wo.checklist.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Checklist
            </Typography>
            <Box sx={{ backgroundColor: alpha(theme.palette.divider, 0.3), borderRadius: 2, p: 1 }}>
              {wo.checklist.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                  }}
                >
                  {item.completed ? (
                    <CheckIcon color="success" fontSize="small" />
                  ) : (
                    <CircleIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Timeline */}
        {wo.timeline && wo.timeline.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Timeline
            </Typography>
            <List dense>
              {wo.timeline.map((entry) => {
                const user = getUserById(entry.userId);
                return (
                  <ListItem key={entry.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={entry.description}
                      secondary={`${user?.firstName} ${user?.lastName} - ${formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function CreateWODialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    assetId: '',
    faultType: '',
    description: '',
    priority: 'P3' as Priority,
    assignedToId: '',
  });

  const faultTypes = [
    'Mechanical Failure',
    'Electrical Fault',
    'Refrigerant Leak',
    'Control System',
    'Noise/Vibration',
    'Temperature Issue',
    'Preventive Maintenance',
    'Other',
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Work Order</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Asset</InputLabel>
              <Select
                value={formData.assetId}
                label="Asset"
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              >
                {assets.map((asset) => (
                  <MenuItem key={asset.id} value={asset.id}>
                    {asset.name} - {asset.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Fault Type</InputLabel>
              <Select
                value={formData.faultType}
                label="Fault Type"
                onChange={(e) => setFormData({ ...formData, faultType: e.target.value })}
              >
                {faultTypes.map((type) => (
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
                value={formData.priority}
                label="Priority"
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              >
                <MenuItem value="P1">P1 - Critical (4h SLA)</MenuItem>
                <MenuItem value="P2">P2 - High (8h SLA)</MenuItem>
                <MenuItem value="P3">P3 - Medium (24h SLA)</MenuItem>
                <MenuItem value="P4">P4 - Low (72h SLA)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Assign To (Optional)</InputLabel>
              <Select
                value={formData.assignedToId}
                label="Assign To (Optional)"
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users
                  .filter((u) => u.role === 'technician')
                  .map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
