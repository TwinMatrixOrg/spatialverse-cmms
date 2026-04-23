import { AnimatedPanel } from '../components/AnimatedPage';
import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  ElectricBolt as UtilityIcon,
  Search as SearchIcon,
  TrendingUp as TrendIcon,
  WaterDrop as MeterIcon,
} from '@mui/icons-material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { sites, UtilityType, utilityTypeLabels } from '../data/mockData';

type BillFormState = {
  utilityType: UtilityType;
  siteId: string;
  billingPeriod: string;
  amountRM: string;
  units: string;
  unitLabel: string;
  remarks: string;
};

type ReadingFormState = {
  utilityType: UtilityType;
  siteId: string;
  meterId: string;
  readingDate: string;
  previousReading: string;
  currentReading: string;
  unitLabel: string;
};

const utilityTypes: UtilityType[] = ['Electricity', 'Water', 'Gas', 'Chilled Water', 'Sewerage'];

const formatRM = (value: number) =>
  `RM ${value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatMonth = (period: string) => {
  const parsedDate = new Date(`${period}-01T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return period;
  }
  return format(parsedDate, 'MMM yyyy');
};

const getDefaultUnitLabel = (utilityType: UtilityType) => {
  switch (utilityType) {
    case 'Electricity':
      return 'kWh';
    case 'Water':
      return 'm³';
    case 'Gas':
      return 'MMBtu';
    case 'Chilled Water':
      return 'RT-hr';
    case 'Sewerage':
      return 'm³';
    default:
      return 'unit';
  }
};

export default function UtilityManagement() {
  const theme = useTheme();
  const { selectedSiteId, utilityBills, meterReadings, addUtilityBill, addMeterReading } = useStore();
  const [billFilterType, setBillFilterType] = useState<UtilityType | 'all'>('all');
  const [billFilterSite, setBillFilterSite] = useState<string>(selectedSiteId || 'all');
  const [tableSearch, setTableSearch] = useState('');

  const [billForm, setBillForm] = useState<BillFormState>({
    utilityType: 'Electricity',
    siteId: selectedSiteId || 'site-1',
    billingPeriod: format(new Date(), 'yyyy-MM'),
    amountRM: '',
    units: '',
    unitLabel: getDefaultUnitLabel('Electricity'),
    remarks: '',
  });

  const [readingForm, setReadingForm] = useState<ReadingFormState>({
    utilityType: 'Electricity',
    siteId: selectedSiteId || 'site-1',
    meterId: '',
    readingDate: format(new Date(), 'yyyy-MM-dd'),
    previousReading: '',
    currentReading: '',
    unitLabel: getDefaultUnitLabel('Electricity'),
  });

  const filteredBills = useMemo(() => {
    const lowerSearch = tableSearch.trim().toLowerCase();

    return utilityBills
      .filter((bill) => (billFilterType === 'all' ? true : bill.utilityType === billFilterType))
      .filter((bill) => (billFilterSite === 'all' ? true : bill.siteId === billFilterSite))
      .filter((bill) => {
        if (!lowerSearch) {
          return true;
        }

        const siteName = sites.find((site) => site.id === bill.siteId)?.name || '';
        return (
          bill.billingPeriod.toLowerCase().includes(lowerSearch)
          || bill.utilityType.toLowerCase().includes(lowerSearch)
          || siteName.toLowerCase().includes(lowerSearch)
        );
      })
      .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod));
  }, [billFilterSite, billFilterType, tableSearch, utilityBills]);

  const chartData = useMemo(() => {
    const groupedByPeriod = filteredBills.reduce<Record<string, { amountRM: number; units: number }>>(
      (accumulator, bill) => {
        const current = accumulator[bill.billingPeriod] || { amountRM: 0, units: 0 };
        return {
          ...accumulator,
          [bill.billingPeriod]: {
            amountRM: current.amountRM + bill.amountRM,
            units: current.units + bill.units,
          },
        };
      },
      {}
    );

    return Object.entries(groupedByPeriod)
      .sort(([periodA], [periodB]) => periodA.localeCompare(periodB))
      .map(([period, metrics]) => ({
        period: formatMonth(period),
        amountRM: Math.round(metrics.amountRM),
        units: Math.round(metrics.units),
      }));
  }, [filteredBills]);

  const latestMeterReadings = useMemo(
    () => meterReadings.slice().sort((a, b) => b.readingDate.localeCompare(a.readingDate)).slice(0, 8),
    [meterReadings]
  );

  const handleBillSubmit = () => {
    const amountRM = Number.parseFloat(billForm.amountRM);
    const units = Number.parseFloat(billForm.units);

    if (!Number.isFinite(amountRM) || !Number.isFinite(units)) {
      return;
    }

    addUtilityBill({
      utilityType: billForm.utilityType,
      siteId: billForm.siteId,
      billingPeriod: billForm.billingPeriod,
      amountRM,
      units,
      unitLabel: billForm.unitLabel,
      remarks: billForm.remarks,
    });

    setBillForm((current) => ({
      ...current,
      amountRM: '',
      units: '',
      remarks: '',
    }));
  };

  const handleMeterSubmit = () => {
    const previousReading = Number.parseFloat(readingForm.previousReading);
    const currentReading = Number.parseFloat(readingForm.currentReading);

    if (!Number.isFinite(previousReading) || !Number.isFinite(currentReading)) {
      return;
    }

    addMeterReading({
      utilityType: readingForm.utilityType,
      siteId: readingForm.siteId,
      meterId: readingForm.meterId,
      readingDate: new Date(`${readingForm.readingDate}T00:00:00`).toISOString(),
      previousReading,
      currentReading,
      unitLabel: readingForm.unitLabel,
    });

    setReadingForm((current) => ({
      ...current,
      meterId: '',
      previousReading: '',
      currentReading: '',
    }));
  };

  const totalFilteredCost = filteredBills.reduce((sum, bill) => sum + bill.amountRM, 0);
  const totalFilteredUnits = filteredBills.reduce((sum, bill) => sum + bill.units, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Utility Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            JKR utility billing, meter readings, and consumption trend tracking
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Utility Spend</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700, color: theme.palette.primary.main }}>
                {formatRM(totalFilteredCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Consumption</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700, color: theme.palette.success.main }}>
                {totalFilteredUnits.toLocaleString('en-MY')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Bills in View</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700, color: theme.palette.warning.main }}>
                {filteredBills.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AnimatedPanel delay={1}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <UtilityIcon fontSize="small" /> Bill Entry
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Utility Type"
                    value={billForm.utilityType}
                    onChange={(event) => {
                      const nextType = event.target.value as UtilityType;
                      setBillForm((current) => ({
                        ...current,
                        utilityType: nextType,
                        unitLabel: getDefaultUnitLabel(nextType),
                      }));
                    }}
                  >
                    {utilityTypes.map((utilityType) => (
                      <MenuItem key={utilityType} value={utilityType}>
                        {utilityTypeLabels[utilityType]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Facility"
                    value={billForm.siteId}
                    onChange={(event) => setBillForm((current) => ({ ...current, siteId: event.target.value }))}
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
                    type="month"
                    label="Billing Period"
                    value={billForm.billingPeriod}
                    onChange={(event) => setBillForm((current) => ({ ...current, billingPeriod: event.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Amount"
                    value={billForm.amountRM}
                    onChange={(event) => setBillForm((current) => ({ ...current, amountRM: event.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start">RM</InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Units"
                    value={billForm.units}
                    onChange={(event) => setBillForm((current) => ({ ...current, units: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Unit Label"
                    value={billForm.unitLabel}
                    onChange={(event) => setBillForm((current) => ({ ...current, unitLabel: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Remarks"
                    value={billForm.remarks}
                    onChange={(event) => setBillForm((current) => ({ ...current, remarks: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleBillSubmit}>
                    Save Bill Entry
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MeterIcon fontSize="small" /> Meter Reading
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Utility Type"
                    value={readingForm.utilityType}
                    onChange={(event) => {
                      const nextType = event.target.value as UtilityType;
                      setReadingForm((current) => ({
                        ...current,
                        utilityType: nextType,
                        unitLabel: getDefaultUnitLabel(nextType),
                      }));
                    }}
                  >
                    {utilityTypes.map((utilityType) => (
                      <MenuItem key={utilityType} value={utilityType}>
                        {utilityTypeLabels[utilityType]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Facility"
                    value={readingForm.siteId}
                    onChange={(event) => setReadingForm((current) => ({ ...current, siteId: event.target.value }))}
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
                    label="Meter ID"
                    value={readingForm.meterId}
                    onChange={(event) => setReadingForm((current) => ({ ...current, meterId: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Reading Date"
                    value={readingForm.readingDate}
                    onChange={(event) => setReadingForm((current) => ({ ...current, readingDate: event.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Previous"
                    value={readingForm.previousReading}
                    onChange={(event) => setReadingForm((current) => ({ ...current, previousReading: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Current"
                    value={readingForm.currentReading}
                    onChange={(event) => setReadingForm((current) => ({ ...current, currentReading: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Unit"
                    value={readingForm.unitLabel}
                    onChange={(event) => setReadingForm((current) => ({ ...current, unitLabel: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleMeterSubmit}>
                    Save Meter Reading
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </AnimatedPanel>

      <AnimatedPanel delay={2}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendIcon fontSize="small" /> Utility Trend
              </Typography>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="amountRM" name="Amount (RM)" stroke={theme.palette.primary.main} strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="units" name="Units" stroke={theme.palette.success.main} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Latest Meter Readings</Typography>
              {latestMeterReadings.map((reading) => {
                const siteName = sites.find((site) => site.id === reading.siteId)?.name || reading.siteId;
                return (
                  <Box
                    key={reading.id}
                    sx={{
                      mb: 1.25,
                      p: 1.25,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{reading.meterId}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {siteName} · {utilityTypeLabels[reading.utilityType]}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                      {reading.consumption.toLocaleString('en-MY')} {reading.unitLabel}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </AnimatedPanel>

      <AnimatedPanel delay={3}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search utility bill table..."
              value={tableSearch}
              onChange={(event) => setTableSearch(event.target.value)}
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
              label="Utility"
              value={billFilterType}
              onChange={(event) => setBillFilterType(event.target.value as UtilityType | 'all')}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Utilities</MenuItem>
              {utilityTypes.map((utilityType) => (
                <MenuItem key={utilityType} value={utilityType}>{utilityTypeLabels[utilityType]}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              label="Facility"
              value={billFilterSite}
              onChange={(event) => setBillFilterSite(event.target.value)}
              sx={{ minWidth: 180 }}
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
                  <TableCell>Period</TableCell>
                  <TableCell>Utility</TableCell>
                  <TableCell>Facility</TableCell>
                  <TableCell align="right">Amount (RM)</TableCell>
                  <TableCell align="right">Units</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id} hover>
                    <TableCell>{formatMonth(bill.billingPeriod)}</TableCell>
                    <TableCell>{utilityTypeLabels[bill.utilityType]}</TableCell>
                    <TableCell>{sites.find((site) => site.id === bill.siteId)?.name || bill.siteId}</TableCell>
                    <TableCell align="right">{formatRM(bill.amountRM)}</TableCell>
                    <TableCell align="right">
                      {bill.units.toLocaleString('en-MY')} {bill.unitLabel}
                    </TableCell>
                    <TableCell>{bill.remarks || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      </AnimatedPanel>
    </Box>
  );
}
