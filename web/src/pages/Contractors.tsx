import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Grid2 as Grid,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Timer as TimerIcon,
  CheckCircle as CheckIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { format, differenceInDays, isBefore } from 'date-fns';
import { contractors, Contractor, AssetType } from '../data/mockData';

const specialtyColors: Record<AssetType, string> = {
  HVAC: '#29B6F6',
  Electrical: '#FFA726',
  Plumbing: '#66BB6A',
  'Fire Safety': '#EF5350',
  Elevator: '#AB47BC',
  Structural: '#78909C',
  'IT/AV': '#7C4DFF',
  General: '#90A4AE',
};

export default function Contractors() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  const filteredContractors = contractors.filter((contractor) => {
    if (specialtyFilter !== 'all' && !contractor.specialties.includes(specialtyFilter as AssetType)) {
      return false;
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        contractor.companyName.toLowerCase().includes(search) ||
        contractor.contactName.toLowerCase().includes(search) ||
        contractor.specialties.some((s) => s.toLowerCase().includes(search))
      );
    }
    return true;
  });

  const getLicenseStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: 'unknown', label: 'No License', color: 'default' as const };
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, new Date());

    if (isBefore(expiry, new Date())) {
      return { status: 'expired', label: 'Expired', color: 'error' as const };
    }
    if (daysUntilExpiry <= 30) {
      return { status: 'expiring', label: `${daysUntilExpiry}d left`, color: 'warning' as const };
    }
    return { status: 'valid', label: 'Valid', color: 'success' as const };
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Contractors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredContractors.length} registered contractors
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Contractor
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {contractors.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Contractors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {contractors.filter((c) => c.performanceScore >= 90).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top Performers (90%+)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {contractors.filter((c) => {
                  const status = getLicenseStatus(c.licenseExpiry);
                  return status.status === 'expiring';
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                License Expiring Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>
                {contractors.filter((c) => {
                  const status = getLicenseStatus(c.licenseExpiry);
                  return status.status === 'expired';
                }).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                License Expired
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search contractors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            onClick={() => setSpecialtyFilter('all')}
            color={specialtyFilter === 'all' ? 'primary' : 'default'}
            variant={specialtyFilter === 'all' ? 'filled' : 'outlined'}
          />
          {Object.keys(specialtyColors).map((specialty) => (
            <Chip
              key={specialty}
              label={specialty}
              onClick={() => setSpecialtyFilter(specialty)}
              sx={{
                backgroundColor:
                  specialtyFilter === specialty
                    ? specialtyColors[specialty as AssetType]
                    : 'transparent',
                color:
                  specialtyFilter === specialty
                    ? 'white'
                    : specialtyColors[specialty as AssetType],
                borderColor: specialtyColors[specialty as AssetType],
              }}
              variant={specialtyFilter === specialty ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Contractors Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contractor</TableCell>
              <TableCell>Specialties</TableCell>
              <TableCell>License Status</TableCell>
              <TableCell>Insurance</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell>Active WOs</TableCell>
              <TableCell>Avg Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContractors.map((contractor) => {
              const licenseStatus = getLicenseStatus(contractor.licenseExpiry);
              const insuranceStatus = getLicenseStatus(contractor.insuranceExpiry);

              return (
                <TableRow
                  key={contractor.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelectedContractor(contractor)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          color: 'primary.main',
                        }}
                      >
                        {contractor.companyName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {contractor.companyName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contractor.contactName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {contractor.specialties.map((specialty) => (
                        <Chip
                          key={specialty}
                          label={specialty}
                          size="small"
                          sx={{
                            backgroundColor: alpha(specialtyColors[specialty], 0.15),
                            color: specialtyColors[specialty],
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={licenseStatus.label}
                      color={licenseStatus.color}
                      icon={licenseStatus.status === 'expired' ? <WarningIcon /> : undefined}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={insuranceStatus.label} color={insuranceStatus.color} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={contractor.performanceScore}
                        sx={{
                          width: 60,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.divider, 0.3),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor:
                              contractor.performanceScore >= 90
                                ? theme.palette.success.main
                                : contractor.performanceScore >= 70
                                ? theme.palette.warning.main
                                : theme.palette.error.main,
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 35 }}>
                        {contractor.performanceScore}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={contractor.activeWorkOrdersCount}
                      color={contractor.activeWorkOrdersCount > 3 ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{contractor.avgResponseTime}h</Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Contractor Detail Drawer */}
      <Drawer
        anchor="right"
        open={!!selectedContractor}
        onClose={() => setSelectedContractor(null)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 420 } },
        }}
      >
        {selectedContractor && (
          <ContractorDetail
            contractor={selectedContractor}
            onClose={() => setSelectedContractor(null)}
          />
        )}
      </Drawer>
    </Box>
  );
}

function ContractorDetail({ contractor, onClose }: { contractor: Contractor; onClose: () => void }) {
  const theme = useTheme();
  const licenseStatus = contractor.licenseExpiry
    ? differenceInDays(new Date(contractor.licenseExpiry), new Date())
    : null;
  const insuranceStatus = contractor.insuranceExpiry
    ? differenceInDays(new Date(contractor.insuranceExpiry), new Date())
    : null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: 'primary.main',
              fontSize: '1.5rem',
            }}
          >
            {contractor.companyName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {contractor.companyName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contractor.contactName}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Contact Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Contact Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">{contractor.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">{contractor.phone}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Specialties */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Specialties
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {contractor.specialties.map((specialty) => (
              <Chip
                key={specialty}
                label={specialty}
                sx={{
                  backgroundColor: alpha(specialtyColors[specialty], 0.15),
                  color: specialtyColors[specialty],
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Licenses */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Compliance
          </Typography>
          <List disablePadding>
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemText
                primary="License Number"
                secondary={contractor.licenseNumber || 'Not provided'}
                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                secondaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemText
                primary="License Expiry"
                secondary={
                  contractor.licenseExpiry
                    ? format(new Date(contractor.licenseExpiry), 'MMMM d, yyyy')
                    : 'Not provided'
                }
                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500,
                  color:
                    licenseStatus !== null && licenseStatus <= 0
                      ? 'error.main'
                      : licenseStatus !== null && licenseStatus <= 30
                      ? 'warning.main'
                      : 'text.primary',
                }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemText
                primary="Insurance Expiry"
                secondary={
                  contractor.insuranceExpiry
                    ? format(new Date(contractor.insuranceExpiry), 'MMMM d, yyyy')
                    : 'Not provided'
                }
                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500,
                  color:
                    insuranceStatus !== null && insuranceStatus <= 0
                      ? 'error.main'
                      : insuranceStatus !== null && insuranceStatus <= 30
                      ? 'warning.main'
                      : 'text.primary',
                }}
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Performance Metrics */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Performance Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {contractor.performanceScore}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Performance Score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {contractor.avgResponseTime}h
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {contractor.completionRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completion Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {contractor.activeWorkOrdersCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active Work Orders
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
