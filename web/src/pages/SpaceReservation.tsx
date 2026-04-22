import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  EventAvailable as BookingIcon,
} from '@mui/icons-material';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useStore } from '../store/useStore';
import { reservationStatusLabels, SpaceReservationStatus, sites } from '../data/mockData';

const statusColor: Record<SpaceReservationStatus, string> = {
  pending: '#FFA726',
  approved: '#66BB6A',
  rejected: '#EF5350',
};

const rooms = [
  'FM Command Room',
  'Operations Boardroom',
  'Training Room A',
  'Training Room B',
  'Training Room C',
  'Meeting Pod 1',
  'Meeting Pod 2',
  'Meeting Pod 3',
];

type ReservationFormState = {
  siteId: string;
  room: string;
  startDateTime: string;
  endDateTime: string;
  requester: string;
  event: string;
  participants: string;
  remarks: string;
};

const toDateTimeInput = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

export default function SpaceReservation() {
  const { selectedSiteId, spaceReservations, createSpaceReservation, updateSpaceReservationStatus } = useStore();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<SpaceReservationStatus | 'all'>('all');
  const [siteFilter, setSiteFilter] = useState(selectedSiteId || 'all');
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const [reservationForm, setReservationForm] = useState<ReservationFormState>({
    siteId: selectedSiteId || 'site-1',
    room: rooms[0],
    startDateTime: toDateTimeInput(addDays(new Date(), 1)),
    endDateTime: toDateTimeInput(addDays(new Date(Date.now() + 90 * 60 * 1000), 1)),
    requester: 'Facility Team',
    event: '',
    participants: '8',
    remarks: '',
  });

  const filteredReservations = useMemo(
    () =>
      spaceReservations
        .filter((reservation) => (statusFilter === 'all' ? true : reservation.status === statusFilter))
        .filter((reservation) => (siteFilter === 'all' ? true : reservation.siteId === siteFilter))
        .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime)),
    [siteFilter, spaceReservations, statusFilter]
  );

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const visibleStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const visibleEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days: Date[] = [];
    let cursor = visibleStart;

    while (cursor <= visibleEnd) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }

    return days;
  }, [calendarMonth]);

  const reservationsByDay = useMemo(() => {
    return spaceReservations.reduce<Record<string, number>>((accumulator, reservation) => {
      const key = format(parseISO(reservation.startDateTime), 'yyyy-MM-dd');
      return {
        ...accumulator,
        [key]: (accumulator[key] || 0) + 1,
      };
    }, {});
  }, [spaceReservations]);

  const handleSubmitReservation = () => {
    const participants = Number.parseInt(reservationForm.participants, 10);

    const result = createSpaceReservation({
      siteId: reservationForm.siteId,
      room: reservationForm.room,
      startDateTime: new Date(reservationForm.startDateTime).toISOString(),
      endDateTime: new Date(reservationForm.endDateTime).toISOString(),
      requester: reservationForm.requester,
      event: reservationForm.event,
      participants,
      remarks: reservationForm.remarks,
    });

    if (result.conflict) {
      setConflictMessage(
        `Conflict detected with "${result.conflict.event}" (${format(parseISO(result.conflict.startDateTime), 'dd MMM, HH:mm')} - ${format(parseISO(result.conflict.endDateTime), 'HH:mm')}).`
      );
      return;
    }

    setConflictMessage(null);
    setReservationForm((current) => ({
      ...current,
      event: '',
      remarks: '',
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Space Reservations</Typography>
          <Typography variant="body2" color="text.secondary">
            Room booking, conflict checks, approval workflow, and monthly calendar view
          </Typography>
        </Box>
      </Box>

      {conflictMessage && <Alert severity="error" sx={{ mb: 2 }}>{conflictMessage}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BookingIcon fontSize="small" /> Booking Form
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Facility"
                    value={reservationForm.siteId}
                    onChange={(event) => setReservationForm((current) => ({ ...current, siteId: event.target.value }))}
                  >
                    {sites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Room"
                    value={reservationForm.room}
                    onChange={(event) => setReservationForm((current) => ({ ...current, room: event.target.value }))}
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room} value={room}>{room}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="Start"
                    value={reservationForm.startDateTime}
                    onChange={(event) => setReservationForm((current) => ({ ...current, startDateTime: event.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="End"
                    value={reservationForm.endDateTime}
                    onChange={(event) => setReservationForm((current) => ({ ...current, endDateTime: event.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Requester"
                    value={reservationForm.requester}
                    onChange={(event) => setReservationForm((current) => ({ ...current, requester: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Participants"
                    value={reservationForm.participants}
                    onChange={(event) => setReservationForm((current) => ({ ...current, participants: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Event"
                    value={reservationForm.event}
                    onChange={(event) => setReservationForm((current) => ({ ...current, event: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Remarks"
                    value={reservationForm.remarks}
                    onChange={(event) => setReservationForm((current) => ({ ...current, remarks: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" onClick={handleSubmitReservation}>Submit Booking</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" /> {format(calendarMonth, 'MMMM yyyy')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => setCalendarMonth((current) => addDays(startOfMonth(current), -1))}>
                    <PrevIcon fontSize="small" />
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setCalendarMonth((current) => addDays(endOfMonth(current), 1))}>
                    <NextIcon fontSize="small" />
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={1}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((weekday) => (
                  <Grid key={weekday} size={{ xs: 12 / 7 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{weekday}</Typography>
                  </Grid>
                ))}

                {calendarDays.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const bookingCount = reservationsByDay[dayKey] || 0;
                  return (
                    <Grid key={dayKey} size={{ xs: 12 / 7 }}>
                      <Box
                        sx={{
                          minHeight: 74,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          p: 1,
                          backgroundColor: isSameDay(day, new Date())
                            ? alpha('#42A5F5', 0.1)
                            : isSameMonth(day, calendarMonth)
                              ? 'background.paper'
                              : alpha('#9E9E9E', 0.08),
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: isSameMonth(day, calendarMonth) ? 'text.primary' : 'text.disabled',
                            fontWeight: 600,
                          }}
                        >
                          {format(day, 'd')}
                        </Typography>
                        {bookingCount > 0 && (
                          <Chip
                            size="small"
                            label={`${bookingCount} booking${bookingCount > 1 ? 's' : ''}`}
                            sx={{ mt: 0.8, height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as SpaceReservationStatus | 'all')}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {(['pending', 'approved', 'rejected'] as SpaceReservationStatus[]).map((status) => (
                <MenuItem key={status} value={status}>{reservationStatusLabels[status]}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              label="Facility"
              value={siteFilter}
              onChange={(event) => setSiteFilter(event.target.value)}
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="all">All Facilities</MenuItem>
              {sites.map((site) => (
                <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Room</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Participants</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{reservation.room}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sites.find((site) => site.id === reservation.siteId)?.name || reservation.siteId}
                      </Typography>
                    </TableCell>
                    <TableCell>{reservation.event}</TableCell>
                    <TableCell>{reservation.requester}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{format(parseISO(reservation.startDateTime), 'dd MMM yyyy')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(parseISO(reservation.startDateTime), 'HH:mm')} - {format(parseISO(reservation.endDateTime), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{reservation.participants}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={reservationStatusLabels[reservation.status]}
                        sx={{
                          backgroundColor: alpha(statusColor[reservation.status], 0.15),
                          color: statusColor[reservation.status],
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          disabled={reservation.status !== 'pending'}
                          onClick={() => updateSpaceReservationStatus(reservation.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={reservation.status !== 'pending'}
                          onClick={() => updateSpaceReservationStatus(reservation.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
