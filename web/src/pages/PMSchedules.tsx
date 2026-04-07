import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
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
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Grid2 as Grid,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
} from 'date-fns';
import { useStore } from '../store/useStore';
import { pmSchedules, getAssetById, getSiteById, getUserById, PMSchedule, PMFrequency } from '../data/mockData';

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
  upcoming: '#FFA726',
  overdue: '#EF5350',
  done: '#66BB6A',
};

export default function PMSchedules() {
  const theme = useTheme();
  const { selectedSiteId } = useStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<PMFrequency | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'overdue' | 'done'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPM, setSelectedPM] = useState<PMSchedule | null>(null);

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
  }, [selectedSiteId, frequencyFilter, statusFilter, searchQuery]);

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
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          PM Schedules
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search schedules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 220 }}
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
        >
          <ToggleButton value="calendar">
            <CalendarIcon sx={{ mr: 0.5 }} /> Calendar
          </ToggleButton>
          <ToggleButton value="list">
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
                        sx={{
                          height: 100,
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: today
                            ? alpha(theme.palette.primary.main, 0.1)
                            : theme.palette.mode === 'dark'
                            ? alpha('#fff', 0.02)
                            : alpha('#000', 0.02),
                          border: today ? `2px solid ${theme.palette.primary.main}` : 'none',
                          overflow: 'hidden',
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={today ? 700 : 400}
                          color={today ? 'primary.main' : 'text.secondary'}
                        >
                          {format(day, 'd')}
                        </Typography>
                        <Box sx={{ mt: 0.5, overflow: 'auto', maxHeight: 72 }}>
                          {dayPMs.slice(0, 3).map(pm => {
                            const asset = getAssetById(pm.assetId);
                            return (
                              <Chip
                                key={pm.id}
                                size="small"
                                label={asset?.name || pm.name}
                                onClick={() => setSelectedPM(pm)}
                                sx={{
                                  mb: 0.5,
                                  height: 20,
                                  fontSize: '0.6rem',
                                  width: '100%',
                                  justifyContent: 'flex-start',
                                  backgroundColor: alpha(statusColors[pm.status], 0.15),
                                  color: statusColors[pm.status],
                                  cursor: 'pointer',
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  },
                                }}
                              />
                            );
                          })}
                          {dayPMs.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{dayPMs.length - 3} more
                            </Typography>
                          )}
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
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>PM Name</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Last Done</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Auto WO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPMs.map(pm => {
                const asset = getAssetById(pm.assetId);
                const site = getSiteById(pm.siteId);
                const assignee = pm.assignedToId ? getUserById(pm.assignedToId) : null;

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
                    <TableCell>
                      <Typography variant="body2">{asset?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {site?.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {pm.frequency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {pm.lastDoneDate ? format(new Date(pm.lastDoneDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(pm.nextDueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={pm.status}
                        sx={{
                          textTransform: 'capitalize',
                          backgroundColor: alpha(statusColors[pm.status], 0.15),
                          color: statusColors[pm.status],
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch checked={pm.autoCreateWO} size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
