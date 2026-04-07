import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { ChevronRight as ChevronRightIcon, Event as EventIcon } from '@mui/icons-material';
import { format, isToday, isTomorrow, addDays, isBefore } from 'date-fns';
import { pmSchedules, getAssetById } from '../../data/mockData';
import { useStore } from '../../store/useStore';

export default function UpcomingPM() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { selectedSiteId } = useStore();

  const filteredPMs = selectedSiteId
    ? pmSchedules.filter(pm => pm.siteId === selectedSiteId)
    : pmSchedules;

  // Get upcoming PMs in the next 7 days
  const today = new Date();
  const nextWeek = addDays(today, 7);

  const upcomingPMs = filteredPMs
    .filter(pm => {
      const dueDate = new Date(pm.nextDueDate);
      return (pm.status === 'upcoming' || pm.status === 'overdue') && isBefore(dueDate, nextWeek);
    })
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 8);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isBefore(date, today)) return 'Overdue';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isBefore(date, today)) return 'error';
    if (isToday(date)) return 'warning';
    if (isTomorrow(date)) return 'info';
    return 'default';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Upcoming PM Schedule
          </Typography>
          <Tooltip title="View all">
            <IconButton size="small" onClick={() => navigate('/pm-schedules')}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Next 7 days
        </Typography>
      </CardContent>
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, pb: 2 }}>
        <List disablePadding>
          {upcomingPMs.map((pm) => {
            const asset = getAssetById(pm.assetId);
            return (
              <ListItem
                key={pm.id}
                sx={{
                  px: 1.5,
                  py: 1,
                  mb: 1,
                  borderRadius: 1.5,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid',
                  borderColor: pm.status === 'overdue' ? 'error.main' : 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                onClick={() => navigate('/pm-schedules')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: pm.status === 'overdue'
                        ? 'error.main'
                        : theme.palette.mode === 'dark'
                        ? 'rgba(0, 188, 212, 0.2)'
                        : 'rgba(0, 188, 212, 0.1)',
                      color: pm.status === 'overdue' ? 'white' : 'primary.main',
                    }}
                  >
                    <EventIcon fontSize="small" />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {pm.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {asset?.name} • {pm.frequency}
                    </Typography>
                  </Box>
                  <Chip
                    label={getDateLabel(pm.nextDueDate)}
                    size="small"
                    color={getDateColor(pm.nextDueDate)}
                    sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                  />
                </Box>
              </ListItem>
            );
          })}
          {upcomingPMs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No upcoming PM schedules
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Card>
  );
}
