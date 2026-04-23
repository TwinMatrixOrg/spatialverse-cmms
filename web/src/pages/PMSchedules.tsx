import { useState, useMemo, MouseEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Grid2 as Grid,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Checklist as ChecklistIcon,
  AddTask as AddTaskIcon,
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
  differenceInCalendarDays,
  startOfDay,
} from 'date-fns';
import { useStore } from '../store/useStore';
import {
  getAssetById,
  getSiteById,
  getUserById,
  PMSchedule,
  PMFrequency,
  AssetType,
} from '../data/mockData';

const frequencyOptions: PMFrequency[] = [
  'daily',
  'weekly',
  'bi-weekly',
  'monthly',
  'quarterly',
  'semi-annual',
  'annual',
];

const statusColors = {
  upcoming: '#66BB6A',
  overdue: '#EF5350',
  done: '#29B6F6',
};

const dueStatusColors = {
  upcoming: '#1E88E5',
  dueToday: '#FB8C00',
  overdue: '#E53935',
  completed: '#43A047',
};

const checklistTemplates: Record<string, string[]> = {
  HVAC: [
    'Check refrigerant',
    'Inspect filters (replace if needed)',
    'Clean coils',
    'Check electrical connections',
    'Test thermostat',
    'Log temperature readings',
    'Check condensate drain',
    'Inspect belts/bearings',
  ],
  Electrical: [
    'Check panel connections',
    'Test circuit breakers',
    'Inspect wiring insulation',
    'Check earthing',
    'Test RCD/ELCB',
    'Measure voltage/current',
    'Check surge protectors',
  ],
  Plumbing: [
    'Check for leaks',
    'Test water pressure',
    'Inspect pipe insulation',
    'Check valves',
    'Flush drains',
    'Check water quality',
  ],
  'Fire Safety': [
    'Test smoke detectors',
    'Check fire extinguisher pressure',
    'Inspect sprinkler heads',
    'Check fire doors',
    'Test alarm panel',
    'Check emergency lighting',
  ],
  Elevator: [
    'Check door operation',
    'Inspect cables',
    'Test emergency brake',
    'Check lubrication',
    'Test emergency phone',
    'Check lighting',
  ],
  General: [
    'Visual inspection',
    'Check for damage',
    'Clean equipment',
    'Lubricate moving parts',
    'Log condition',
  ],
  'Waste Collection': [
    'Collect general waste bags',
    'Sort recyclables into correct bins',
    'Check bin condition and lids',
    'Log waste volume by category',
    'Dispose hazardous waste if needed',
  ],
  'Cleaning': [
    'Inspect floor condition',
    'Check restroom supplies and fixtures',
    'Wipe surfaces and fixtures',
    'Mop or vacuum floors',
    'Verify waste bins emptied and replaced',
  ],
};

const getDueStatus = (pmSchedule: PMSchedule) => {
  if (pmSchedule.status === 'done') {
    return { key: 'completed', label: 'Completed', color: dueStatusColors.completed };
  }

  const daysUntilDue = differenceInCalendarDays(
    startOfDay(new Date(pmSchedule.nextDueDate)),
    startOfDay(new Date())
  );

  if (daysUntilDue < 0) {
    return { key: 'overdue', label: 'Overdue', color: dueStatusColors.overdue };
  }
  if (daysUntilDue === 0) {
    return { key: 'dueToday', label: 'Due Today', color: dueStatusColors.dueToday };
  }

  return { key: 'upcoming', label: 'Upcoming', color: dueStatusColors.upcoming };
};

const getDaysUntilDueMeta = (pmSchedule: PMSchedule) => {
  const dueStatus = getDueStatus(pmSchedule);
  if (dueStatus.key === 'completed') {
    return { label: 'Completed', color: dueStatusColors.completed };
  }

  const daysUntilDue = differenceInCalendarDays(
    startOfDay(new Date(pmSchedule.nextDueDate)),
    startOfDay(new Date())
  );

  if (daysUntilDue < 0) {
    return {
      label: `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'} overdue`,
      color: dueStatusColors.overdue,
    };
  }
  if (daysUntilDue === 0) {
    return { label: 'Due today', color: dueStatusColors.dueToday };
  }

  return {
    label: `${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
    color: daysUntilDue <= 2 ? dueStatusColors.dueToday : dueStatusColors.upcoming,
  };
};

export default function PMSchedules() {
  const theme = useTheme();
  const { selectedSiteId, pmSchedules, generateWOFromPMSchedule } = useStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<PMFrequency | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'overdue' | 'done'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPM, setSelectedPM] = useState<PMSchedule | null>(null);
  const [selectedDayAnchor, setSelectedDayAnchor] = useState<HTMLElement | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [selectedDayPMs, setSelectedDayPMs] = useState<PMSchedule[]>([]);
  const [selectedChecklistType, setSelectedChecklistType] = useState<AssetType | null>(null);
  const [checklistTitle, setChecklistTitle] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPMType, setNewPMType] = useState<string>('');
  const [newPMName, setNewPMName] = useState('');
  const [newPMFreq, setNewPMFreq] = useState<string>('monthly');

  const filteredPMs = useMemo(() => {
    return pmSchedules.filter(pm => {
      if (selectedSiteId && pm.siteId !== selectedSiteId) return false;
      if (frequencyFilter !== 'all' && pm.frequency !== frequencyFilter) return false;
      if (statusFilter !== 'all' && pm.status !== statusFilter) return false;
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const asset = getAssetById(pm.assetId);
        return (
          pm.name.toLowerCase().includes(search) ||
          asset?.name.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [pmSchedules, selectedSiteId, frequencyFilter, statusFilter, searchQuery]);

  const handleDayClick = (event: MouseEvent<HTMLElement>, day: Date, daySchedules: PMSchedule[]) => {
    setSelectedDayAnchor(event.currentTarget);
    setSelectedDayDate(day);
    setSelectedDayPMs(daySchedules);
  };

  const handleGenerateWO = (pmSchedule: PMSchedule) => {
    const generatedWO = generateWOFromPMSchedule(pmSchedule);
    const asset = getAssetById(pmSchedule.assetId);
    setSnackbarMessage(`Work order ${generatedWO.number} created for ${asset?.name || pmSchedule.name}`);
  };

  const handleViewChecklist = (pmSchedule: PMSchedule) => {
    const asset = getAssetById(pmSchedule.assetId);
    const templateType = asset?.type === 'Structural' || asset?.type === 'IT/AV' ? 'General' : asset?.type;
    setSelectedChecklistType((templateType || 'General') as AssetType);
    setChecklistTitle(`${asset?.name || pmSchedule.name} — ${templateType || 'General'} Template`);
  };

  // Calendar data
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const pmsByDate = useMemo(() => {
    const map = new Map<string, PMSchedule[]>();
    filteredPMs.forEach(pm => {
      const dateKey = format(new Date(pm.nextDueDate), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(pm);
    });
    return map;
  }, [filteredPMs]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.65rem', sm: '2rem' } }}>
          PM Schedules
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)} size="small">
          New PM Schedule
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search schedules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 220 }, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Frequency</InputLabel>
          <Select
            value={frequencyFilter}
            label="Frequency"
            onChange={(e) => setFrequencyFilter(e.target.value as PMFrequency | 'all')}
          >
            <MenuItem value="all">All</MenuItem>
            {frequencyOptions.map((freq) => (
              <MenuItem key={freq} value={freq} sx={{ textTransform: 'capitalize' }}>
                {freq}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'upcoming' | 'overdue' | 'done')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="done">Done</MenuItem>
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
          <ToggleButton value="calendar" sx={{ flex: { xs: 1, sm: 'initial' } }}>
            <CalendarIcon sx={{ mr: 0.5 }} /> Calendar
          </ToggleButton>
          <ToggleButton value="list" sx={{ flex: { xs: 1, sm: 'initial' } }}>
            <ListIcon sx={{ mr: 0.5 }} /> List
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, overflow: 'hidden' }}>
            {/* Calendar Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
              <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Weekday Headers */}
            <Grid container sx={{ mb: 1 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Grid key={day} size={{ xs: 12 / 7 }}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'center' }}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Grid */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Grid container sx={{ height: '100%' }}>
                {/* Padding for start of month */}
                {Array.from({ length: startPadding }).map((_, i) => (
                  <Grid key={`pad-${i}`} size={{ xs: 12 / 7 }} sx={{ p: 0.5 }}>
                    <Box sx={{ height: 100 }} />
                  </Grid>
                ))}

                {/* Calendar Days */}
                {calendarDays.map(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayPMs = pmsByDate.get(dateKey) || [];
                  const today = isToday(day);

                  return (
                    <Grid key={dateKey} size={{ xs: 12 / 7 }} sx={{ p: 0.5 }}>
                      <Box
                        onClick={(event) => handleDayClick(event, day, dayPMs)}
                        sx={{
                          height: 100,
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: today
                            ? alpha('#14B8A6', 0.1)
                            : theme.palette.mode === 'dark'
                            ? alpha('#fff', 0.02)
                            : alpha('#000', 0.02),
                          border: today ? '2px solid #14B8A6' : `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={today ? 700 : 400}
                          color={today ? '#0F766E' : 'text.secondary'}
                        >
                          {format(day, 'd')}
                        </Typography>
                        <Box sx={{ mt: 0.8, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                          {dayPMs.slice(0, 8).map(pm => (
                            <Box
                              key={pm.id}
                              sx={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                backgroundColor: statusColors[pm.status],
                              }}
                            />
                          ))}
                          {dayPMs.length > 8 && (
                            <Typography variant="caption" color="text.secondary">
                              +{dayPMs.length - 8}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {dayPMs.slice(0, 2).map(pm => (
                            <Chip
                              key={`${pm.id}-mini`}
                              size="small"
                              label={getAssetById(pm.assetId)?.name || pm.name}
                              sx={{
                                maxWidth: '100%',
                                height: 18,
                                fontSize: '0.58rem',
                                backgroundColor: alpha(statusColors[pm.status], 0.12),
                                color: statusColors[pm.status],
                                '& .MuiChip-label': {
                                  px: 0.6,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto', maxWidth: '100%' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>PM Name</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Description</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Frequency</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Last Done</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Days Until Due</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Checklist</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPMs.map(pm => {
                const asset = getAssetById(pm.assetId);
                const site = getSiteById(pm.siteId);
                const dueStatus = getDueStatus(pm);
                const dueMeta = getDaysUntilDueMeta(pm);
                const canGenerateWO = dueStatus.key !== 'completed';
                const description = pm.checklist.slice(0, 2).join(' • ');

                return (
                  <TableRow
                    key={pm.id}
                    hover
                    onClick={() => setSelectedPM(pm)}
                    sx={{ cursor: 'pointer' }}
                    >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {pm.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{asset?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {site?.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {pm.frequency}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {pm.lastDoneDate ? format(new Date(pm.lastDoneDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(pm.nextDueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={dueStatus.label}
                        sx={{
                          textTransform: 'capitalize',
                          backgroundColor: alpha(dueStatus.color, 0.15),
                          color: dueStatus.color,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: dueMeta.color, fontWeight: 600 }}>
                        {dueMeta.label}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ChecklistIcon />}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleViewChecklist(pm);
                        }}
                      >
                        View Checklist
                      </Button>
                    </TableCell>
                    <TableCell>
                      {canGenerateWO ? (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddTaskIcon />}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleGenerateWO(pm);
                          }}
                        >
                          Generate WO
                        </Button>
                      ) : (
                        <Chip size="small" label="Complete" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Popover
        open={Boolean(selectedDayAnchor)}
        anchorEl={selectedDayAnchor}
        onClose={() => setSelectedDayAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: 360 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {selectedDayDate ? `PM Due on ${format(selectedDayDate, 'MMM d, yyyy')}` : 'PM Tasks'}
          </Typography>
          {selectedDayPMs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No PM tasks due on this day.
            </Typography>
          ) : (
            <List dense sx={{ py: 0 }}>
              {selectedDayPMs.map((pmSchedule) => {
                const asset = getAssetById(pmSchedule.assetId);
                return (
                  <ListItem
                    key={pmSchedule.id}
                    onClick={() => {
                      setSelectedPM(pmSchedule);
                      setSelectedDayAnchor(null);
                    }}
                    sx={{
                      px: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 26 }}>
                      <CircleIcon sx={{ fontSize: 10, color: statusColors[pmSchedule.status] }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={asset?.name || pmSchedule.name}
                      secondary={pmSchedule.name}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Popover>

      {/* PM Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedPM)}
        onClose={() => setSelectedPM(null)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 420 } },
        }}
      >
        {selectedPM && <PMDetailPanel pm={selectedPM} onClose={() => setSelectedPM(null)} />}
      </Drawer>

      <Drawer
        anchor="right"
        open={Boolean(selectedChecklistType)}
        onClose={() => setSelectedChecklistType(null)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 420 } },
        }}
      >
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                PPM Checklist Template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {checklistTitle}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedChecklistType(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
            <List dense sx={{ py: 0 }}>
              {(checklistTemplates[selectedChecklistType || 'General'] || checklistTemplates.General).map(
                (item, index) => (
                  <ListItem key={`${item}-${index}`} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )
              )}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Create PM Schedule Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New PM Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Schedule Name" value={newPMName} onChange={(e) => setNewPMName(e.target.value)} fullWidth size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Template / Type</InputLabel>
              <Select value={newPMType} onChange={(e) => setNewPMType(e.target.value)} label="Template / Type">
                {Object.keys(checklistTemplates).map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {newPMType && checklistTemplates[newPMType] && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Preview checklist:</Typography>
                {checklistTemplates[newPMType].map((item, i) => (
                  <Typography key={i} variant="body2" sx={{ fontSize: '0.85rem' }}>• {item}</Typography>
                ))}
              </Box>
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Frequency</InputLabel>
              <Select value={newPMFreq} onChange={(e) => setNewPMFreq(e.target.value)} label="Frequency">
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setSelectedChecklistType((newPMType || 'General') as AssetType);
            setChecklistTitle(`${newPMName || 'New PM'} — ${newPMType || 'General'} Template`);
            setCreateDialogOpen(false);
            setSnackbarMessage(`PM schedule template '${newPMType}' selected`);
          }} disabled={!newPMName}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarMessage('')} severity="success" variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function PMDetailPanel({ pm, onClose }: { pm: PMSchedule; onClose: () => void }) {
  const theme = useTheme();
  const asset = getAssetById(pm.assetId);
  const site = getSiteById(pm.siteId);
  const assignee = pm.assignedToId ? getUserById(pm.assignedToId) : null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {pm.name}
          </Typography>
          <Chip
            size="small"
            label={pm.status}
            sx={{
              mt: 0.5,
              textTransform: 'capitalize',
              backgroundColor: alpha(statusColors[pm.status], 0.15),
              color: statusColors[pm.status],
            }}
          />
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Asset
            </Typography>
            <Typography variant="body2">{asset?.name}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Site
            </Typography>
            <Typography variant="body2">{site?.name}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Frequency
            </Typography>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {pm.frequency}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Est. Duration
            </Typography>
            <Typography variant="body2">{pm.estimatedDuration} min</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Last Done
            </Typography>
            <Typography variant="body2">
              {pm.lastDoneDate ? format(new Date(pm.lastDoneDate), 'MMM d, yyyy') : '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Next Due
            </Typography>
            <Typography variant="body2">
              {format(new Date(pm.nextDueDate), 'MMM d, yyyy')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Assigned To
            </Typography>
            <Typography variant="body2">
              {assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Auto Create WO
            </Typography>
            <Typography variant="body2">{pm.autoCreateWO ? 'Yes' : 'No'}</Typography>
          </Grid>
        </Grid>

        {/* Checklist */}
        {pm.checklist && pm.checklist.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Checklist
            </Typography>
            <Box sx={{ backgroundColor: alpha(theme.palette.divider, 0.3), borderRadius: 2, p: 1 }}>
              {pm.checklist.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                  }}
                >
                  <CircleIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
