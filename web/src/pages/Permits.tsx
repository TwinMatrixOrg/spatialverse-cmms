import { useMemo, useState } from 'react';
import {
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
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  AssignmentLate as PermitIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getAssetById,
  getUserById,
  permitRiskLabels,
  permitStatusLabels,
  permitTypeLabels,
  PermitChecklistPhase,
  PermitRiskLevel,
  PermitStatus,
  PermitType,
} from '../data/mockData';
import { useStore } from '../store/useStore';

type StatusFilter = 'all' | 'draft' | 'issued' | 'active' | 'closed';

const statusFilterTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
];

const statusColors: Record<PermitStatus, string> = {
  draft: '#90A4AE',
  issued: '#29B6F6',
  active: '#66BB6A',
  closed: '#78909C',
  cancelled: '#EF5350',
};

const riskColors: Record<PermitRiskLevel, string> = {
  low: '#66BB6A',
  medium: '#FFA726',
  high: '#EF5350',
};

const checklistPhases: PermitChecklistPhase[] = ['pre', 'during', 'post'];

const phaseLabels: Record<PermitChecklistPhase, string> = {
  pre: 'Pre-work',
  during: 'During Work',
  post: 'Post-work',
};

export default function Permits() {
  const {
    selectedSiteId,
    workOrders,
    permits,
    createPermit,
    updatePermitStatus,
    togglePermitChecklistItem,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(null);
  const [newPermitWorkOrderId, setNewPermitWorkOrderId] = useState('');
  const [newPermitType, setNewPermitType] = useState<PermitType>('general');
  const [newPermitRiskLevel, setNewPermitRiskLevel] = useState<PermitRiskLevel>('medium');
  const [newPermitLocation, setNewPermitLocation] = useState('');

  const workOrderMap = useMemo(() => {
    return new Map(workOrders.map((workOrder) => [workOrder.id, workOrder]));
  }, [workOrders]);

  const permitByWorkOrderId = useMemo(() => {
    return new Map(permits.map((permit) => [permit.workOrderId, permit]));
  }, [permits]);

  const availableWorkOrders = useMemo(() => {
    return workOrders
      .filter((workOrder) => {
        if (selectedSiteId && workOrder.siteId !== selectedSiteId) {
          return false;
        }

        return !permitByWorkOrderId.has(workOrder.id);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [permitByWorkOrderId, selectedSiteId, workOrders]);

  const filteredPermits = useMemo(() => {
    return permits
      .filter((permit) => {
        const linkedWorkOrder = workOrderMap.get(permit.workOrderId);

        if (selectedSiteId && linkedWorkOrder?.siteId !== selectedSiteId) {
          return false;
        }

        if (statusFilter !== 'all' && permit.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime());
  }, [permits, selectedSiteId, statusFilter, workOrderMap]);

  const selectedPermit = useMemo(
    () => permits.find((permit) => permit.id === selectedPermitId) || null,
    [permits, selectedPermitId]
  );

  const checklistByPhase = useMemo(() => {
    if (!selectedPermit) {
      return { pre: [], during: [], post: [] };
    }

    return {
      pre: selectedPermit.safetyChecklist.filter((item) => item.phase === 'pre'),
      during: selectedPermit.safetyChecklist.filter((item) => item.phase === 'during'),
      post: selectedPermit.safetyChecklist.filter((item) => item.phase === 'post'),
    };
  }, [selectedPermit]);

  const postChecklistComplete = checklistByPhase.post.every((item) => item.completed);

  const nextLifecycleAction = useMemo(() => {
    if (!selectedPermit) {
      return null;
    }

    if (selectedPermit.status === 'draft') {
      return { label: 'Issue Permit', status: 'issued' as PermitStatus, disabled: false };
    }

    if (selectedPermit.status === 'issued') {
      return { label: 'Set Permit Active', status: 'active' as PermitStatus, disabled: false };
    }

    if (selectedPermit.status === 'active') {
      return {
        label: 'Close Permit',
        status: 'closed' as PermitStatus,
        disabled: !postChecklistComplete,
      };
    }

    return null;
  }, [postChecklistComplete, selectedPermit]);

  const handleOpenCreateDialog = () => {
    const defaultWorkOrder = availableWorkOrders[0];
    if (!defaultWorkOrder) {
      return;
    }

    const defaultAsset = getAssetById(defaultWorkOrder.assetId);
    setNewPermitWorkOrderId(defaultWorkOrder.id);
    setNewPermitType('general');
    setNewPermitRiskLevel(defaultWorkOrder.priority === 'P1' ? 'high' : defaultWorkOrder.priority === 'P2' ? 'medium' : 'low');
    setNewPermitLocation([defaultAsset?.floor, defaultAsset?.zone].filter(Boolean).join(' • ') || defaultAsset?.name || 'Work Area');
    setCreateDialogOpen(true);
  };

  const handleWorkOrderChange = (workOrderId: string) => {
    setNewPermitWorkOrderId(workOrderId);
    const linkedWorkOrder = workOrderMap.get(workOrderId);
    const linkedAsset = linkedWorkOrder ? getAssetById(linkedWorkOrder.assetId) : null;

    setNewPermitRiskLevel(
      linkedWorkOrder?.priority === 'P1' ? 'high' : linkedWorkOrder?.priority === 'P2' ? 'medium' : 'low'
    );
    setNewPermitLocation([linkedAsset?.floor, linkedAsset?.zone].filter(Boolean).join(' • ') || linkedAsset?.name || 'Work Area');
  };

  const handleCreatePermit = () => {
    if (!newPermitWorkOrderId) {
      return;
    }

    const permit = createPermit({
      workOrderId: newPermitWorkOrderId,
      type: newPermitType,
      riskLevel: newPermitRiskLevel,
      location: newPermitLocation,
    });

    setCreateDialogOpen(false);
    setSelectedPermitId(permit.id);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Permit to Work
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredPermits.length} permits in scope
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          disabled={availableWorkOrders.length === 0}
        >
          New Permit
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 1.5 }}>
          <Tabs
            value={statusFilter}
            onChange={(_, value: StatusFilter) => setStatusFilter(value)}
            sx={{ minHeight: 42 }}
          >
            {statusFilterTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                sx={{ minHeight: 42, textTransform: 'none', fontWeight: 600 }}
              />
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Permit#</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>WO ID</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Valid From / To</TableCell>
              <TableCell>Risk</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPermits.map((permit) => {
              const linkedWorkOrder = workOrderMap.get(permit.workOrderId);

              return (
                <TableRow
                  key={permit.id}
                  hover
                  onClick={() => setSelectedPermitId(permit.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {permit.permitNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={permitTypeLabels[permit.type]}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#00BCD4', 0.15),
                        color: 'primary.main',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{linkedWorkOrder?.number || permit.workOrderId}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {permit.workOrderId}
                    </Typography>
                  </TableCell>
                  <TableCell>{permit.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={permitStatusLabels[permit.status]}
                      size="small"
                      sx={{
                        backgroundColor: alpha(statusColors[permit.status], 0.15),
                        color: statusColors[permit.status],
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{format(new Date(permit.validFrom), 'MMM d, HH:mm')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      to {format(new Date(permit.validTo), 'MMM d, HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={permitRiskLabels[permit.riskLevel]}
                      size="small"
                      sx={{
                        backgroundColor: alpha(riskColors[permit.riskLevel], 0.15),
                        color: riskColors[permit.riskLevel],
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredPermits.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No permits available for this filter.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Drawer
        anchor="right"
        open={Boolean(selectedPermit)}
        onClose={() => setSelectedPermitId(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
      >
        {selectedPermit && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                  {selectedPermit.permitNumber}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
                  <Chip
                    label={permitTypeLabels[selectedPermit.type]}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#00BCD4', 0.15),
                      color: 'primary.main',
                    }}
                  />
                  <Chip
                    label={permitStatusLabels[selectedPermit.status]}
                    size="small"
                    sx={{
                      backgroundColor: alpha(statusColors[selectedPermit.status], 0.15),
                      color: statusColors[selectedPermit.status],
                    }}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedPermitId(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Permit Details
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Work Order
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {workOrderMap.get(selectedPermit.workOrderId)?.number || selectedPermit.workOrderId}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Risk Level
                    </Typography>
                    <Typography variant="body2">{permitRiskLabels[selectedPermit.riskLevel]}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2">{selectedPermit.location}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Issued By
                    </Typography>
                    <Typography variant="body2">{selectedPermit.issuedByName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Valid Window
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(selectedPermit.validFrom), 'MMM d, HH:mm')} -{' '}
                      {format(new Date(selectedPermit.validTo), 'MMM d, HH:mm')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Precautions
                </Typography>
                <List dense>
                  {selectedPermit.precautions.map((precaution, index) => (
                    <ListItem key={`${selectedPermit.id}-precaution-${index}`} sx={{ px: 0 }}>
                      <ListItemText primary={precaution} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Safety Checklist
                </Typography>
                {checklistPhases.map((phase) => (
                  <Box key={phase} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      {phaseLabels[phase]}
                    </Typography>
                    <List dense>
                      {checklistByPhase[phase].map((item) => {
                        const completedByUser = item.completedBy ? getUserById(item.completedBy) : null;

                        return (
                          <ListItem
                            key={item.id}
                            sx={{
                              px: 0,
                              alignItems: 'flex-start',
                              gap: 1,
                            }}
                          >
                            <Checkbox
                              checked={item.completed}
                              onChange={() => togglePermitChecklistItem(selectedPermit.id, item.id)}
                              sx={{ mt: -0.5 }}
                            />
                            <ListItemText
                              primary={item.item}
                              secondary={
                                item.completedAt
                                  ? `Completed by ${
                                      completedByUser
                                        ? `${completedByUser.firstName} ${completedByUser.lastName}`
                                        : item.completedBy || 'Team'
                                    } • ${format(new Date(item.completedAt), 'MMM d, HH:mm')}`
                                  : undefined
                              }
                            />
                            {item.completed && <CheckIcon color="success" fontSize="small" sx={{ mt: 1 }} />}
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              {nextLifecycleAction ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => updatePermitStatus(selectedPermit.id, nextLifecycleAction.status)}
                  disabled={nextLifecycleAction.disabled}
                  startIcon={<PermitIcon />}
                >
                  {nextLifecycleAction.label}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Permit is {permitStatusLabels[selectedPermit.status].toLowerCase()}.
                </Typography>
              )}
              {selectedPermit.status === 'active' && !postChecklistComplete && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                  Complete all post-work checklist items before closing this permit.
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Permit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Work Order</InputLabel>
                <Select
                  value={newPermitWorkOrderId}
                  label="Work Order"
                  onChange={(event) => handleWorkOrderChange(event.target.value)}
                >
                  {availableWorkOrders.map((workOrder) => (
                    <MenuItem key={workOrder.id} value={workOrder.id}>
                      {workOrder.number} • {workOrder.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Permit Type</InputLabel>
                <Select
                  value={newPermitType}
                  label="Permit Type"
                  onChange={(event) => setNewPermitType(event.target.value as PermitType)}
                >
                  {(Object.keys(permitTypeLabels) as PermitType[]).map((type) => (
                    <MenuItem key={type} value={type}>
                      {permitTypeLabels[type]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={newPermitRiskLevel}
                  label="Risk Level"
                  onChange={(event) => setNewPermitRiskLevel(event.target.value as PermitRiskLevel)}
                >
                  {(Object.keys(permitRiskLabels) as PermitRiskLevel[]).map((riskLevel) => (
                    <MenuItem key={riskLevel} value={riskLevel}>
                      {permitRiskLabels[riskLevel]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Location"
                value={newPermitLocation}
                onChange={(event) => setNewPermitLocation(event.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePermit} disabled={!newPermitWorkOrderId}>
            Create Permit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
