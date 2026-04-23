import { AnimatedPanel } from '../components/AnimatedPage';
import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  InputAdornment,
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
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  AssignmentTurnedIn as DlpIcon,
  CalendarMonth as CalendarIcon,
  Search as SearchIcon,
  TaskAlt as NextIcon,
} from '@mui/icons-material';
import { differenceInCalendarDays, format } from 'date-fns';
import { useStore } from '../store/useStore';
import {
  contractors,
  DLPSeverity,
  DLPStatus,
  dlpStatusLabels,
  getContractorById,
  sites,
} from '../data/mockData';

const dlpStatusOrder: DLPStatus[] = ['open', 'in_progress', 'verified', 'accepted'];
const dlpStatusTransitions: Record<DLPStatus, DLPStatus | null> = {
  open: 'in_progress',
  in_progress: 'verified',
  verified: 'accepted',
  accepted: null,
};

const severityColor: Record<DLPSeverity, string> = {
  Low: '#66BB6A',
  Medium: '#FFA726',
  High: '#FB8C00',
  Critical: '#EF5350',
};

const statusColor: Record<DLPStatus, string> = {
  open: '#42A5F5',
  in_progress: '#AB47BC',
  verified: '#FFA726',
  accepted: '#66BB6A',
};

type DefectFormState = {
  siteId: string;
  location: string;
  description: string;
  contractorId: string;
  severity: DLPSeverity;
  targetRectificationDate: string;
  dlpExpiryDate: string;
};

export default function DLPTracker() {
  const theme = useTheme();
  const { selectedSiteId, dlpDefects, createDLPDefect, updateDLPDefectStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState<DLPStatus | 'all'>('all');
  const [siteFilter, setSiteFilter] = useState<string>(selectedSiteId || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  const [defectForm, setDefectForm] = useState<DefectFormState>({
    siteId: selectedSiteId || 'site-1',
    location: '',
    description: '',
    contractorId: contractors[0]?.id || '',
    severity: 'Medium',
    targetRectificationDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    dlpExpiryDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  });

  const filteredDefects = useMemo(() => {
    const loweredSearchTerm = searchTerm.trim().toLowerCase();

    return dlpDefects
      .filter((defect) => (statusFilter === 'all' ? true : defect.status === statusFilter))
      .filter((defect) => (siteFilter === 'all' ? true : defect.siteId === siteFilter))
      .filter((defect) => {
        if (!loweredSearchTerm) {
          return true;
        }

        return (
          defect.defectNo.toLowerCase().includes(loweredSearchTerm)
          || defect.location.toLowerCase().includes(loweredSearchTerm)
          || defect.description.toLowerCase().includes(loweredSearchTerm)
        );
      })
      .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  }, [dlpDefects, searchTerm, siteFilter, statusFilter]);

  const statusCounts = useMemo(
    () => dlpStatusOrder.map((status) => ({ status, count: filteredDefects.filter((defect) => defect.status === status).length })),
    [filteredDefects]
  );

  const expiringSoon = filteredDefects.filter(
    (defect) => differenceInCalendarDays(new Date(defect.dlpExpiryDate), new Date()) <= 30
  ).length;

  const handleCreateDefect = () => {
    createDLPDefect({
      siteId: defectForm.siteId,
      location: defectForm.location,
      description: defectForm.description,
      contractorId: defectForm.contractorId,
      severity: defectForm.severity,
      targetRectificationDate: new Date(`${defectForm.targetRectificationDate}T00:00:00`).toISOString(),
      dlpExpiryDate: new Date(`${defectForm.dlpExpiryDate}T00:00:00`).toISOString(),
    });

    setDefectForm((current) => ({
      ...current,
      location: '',
      description: '',
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>DLP Tracker</Typography>
          <Typography variant="body2" color="text.secondary">
            Defects Liability Period register, workflow control, and expiry monitoring
          </Typography>
        </Box>
      </Box>

      <AnimatedPanel delay={1}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statusCounts.map((statusCount) => (
          <Grid key={statusCount.status} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">{dlpStatusLabels[statusCount.status]}</Typography>
                <Typography variant="h4" sx={{ color: statusColor[statusCount.status], fontWeight: 700 }}>
                  {statusCount.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {expiringSoon > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {expiringSoon} defects have DLP expiry within 30 days and need closeout actions.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DlpIcon fontSize="small" /> Register New Defect
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Facility"
                    value={defectForm.siteId}
                    onChange={(event) => setDefectForm((current) => ({ ...current, siteId: event.target.value }))}
                  >
                    {sites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Severity"
                    value={defectForm.severity}
                    onChange={(event) => setDefectForm((current) => ({ ...current, severity: event.target.value as DLPSeverity }))}
                  >
                    {(['Low', 'Medium', 'High', 'Critical'] as DLPSeverity[]).map((severity) => (
                      <MenuItem key={severity} value={severity}>{severity}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Location"
                    value={defectForm.location}
                    onChange={(event) => setDefectForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Defect Description"
                    value={defectForm.description}
                    onChange={(event) => setDefectForm((current) => ({ ...current, description: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Contractor"
                    value={defectForm.contractorId}
                    onChange={(event) => setDefectForm((current) => ({ ...current, contractorId: event.target.value }))}
                  >
                    {contractors.map((contractor) => (
                      <MenuItem key={contractor.id} value={contractor.id}>{contractor.companyName}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Target Rectification"
                    value={defectForm.targetRectificationDate}
                    onChange={(event) => setDefectForm((current) => ({ ...current, targetRectificationDate: event.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="DLP Expiry"
                    value={defectForm.dlpExpiryDate}
                    onChange={(event) => setDefectForm((current) => ({ ...current, dlpExpiryDate: event.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateDefect}>
                    Register Defect
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CalendarIcon fontSize="small" /> Workflow Guide
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Status workflow: Open → In Progress → Verified → Accepted
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {dlpStatusOrder.map((status) => (
                  <Chip
                    key={status}
                    label={dlpStatusLabels[status]}
                    sx={{
                      backgroundColor: alpha(statusColor[status], 0.14),
                      color: statusColor[status],
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </AnimatedPanel>

      <AnimatedPanel delay={2}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search defects..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 260 }}
            />
            <TextField
              size="small"
              select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as DLPStatus | 'all')}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {dlpStatusOrder.map((status) => (
                <MenuItem key={status} value={status}>{dlpStatusLabels[status]}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              label="Facility"
              value={siteFilter}
              onChange={(event) => setSiteFilter(event.target.value)}
              sx={{ minWidth: 170 }}
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
                  <TableCell>Defect No.</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Contractor</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>DLP Expiry</TableCell>
                  <TableCell align="right">Workflow</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDefects.map((defect) => {
                  const nextStatus = dlpStatusTransitions[defect.status];
                  const daysToExpiry = differenceInCalendarDays(new Date(defect.dlpExpiryDate), new Date());
                  const expiryColor =
                    daysToExpiry <= 14
                      ? theme.palette.error.main
                      : daysToExpiry <= 30
                        ? theme.palette.warning.main
                        : theme.palette.success.main;

                  return (
                    <TableRow key={defect.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{defect.defectNo}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sites.find((site) => site.id === defect.siteId)?.name || defect.siteId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{defect.location}</Typography>
                        <Typography variant="caption" color="text.secondary">{defect.description}</Typography>
                      </TableCell>
                      <TableCell>{getContractorById(defect.contractorId)?.companyName || defect.contractorId}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={defect.severity}
                          sx={{
                            backgroundColor: alpha(severityColor[defect.severity], 0.15),
                            color: severityColor[defect.severity],
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={dlpStatusLabels[defect.status]}
                          sx={{
                            backgroundColor: alpha(statusColor[defect.status], 0.15),
                            color: statusColor[defect.status],
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: expiryColor, fontWeight: 600 }}>
                          {format(new Date(defect.dlpExpiryDate), 'dd MMM yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {daysToExpiry} days remaining
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<NextIcon fontSize="small" />}
                          disabled={!nextStatus}
                          onClick={() => nextStatus && updateDLPDefectStatus(defect.id, nextStatus)}
                        >
                          {nextStatus ? `Move to ${dlpStatusLabels[nextStatus]}` : 'Completed'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      </AnimatedPanel>
    </Box>
  );
}
