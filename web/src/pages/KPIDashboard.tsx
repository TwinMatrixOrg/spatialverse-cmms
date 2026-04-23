import { AnimatedPanel } from '../components/AnimatedPage';
import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  InputAdornment,
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
  Download as ExportIcon,
  Insights as KpiIcon,
  TrendingUp as TrendIcon,
  Calculate as CalculatorIcon,
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

const kpiTargets = {
  css: 80,
  customerRating: 80,
  responseTime: 100,
  pmCompliance: 90,
  woCompletion: 90,
  slaAdherence: 92,
};

const metricConfig = [
  { key: 'css', label: 'CSS', target: kpiTargets.css },
  { key: 'customerRating', label: 'Customer Rating', target: kpiTargets.customerRating },
  { key: 'responseTime', label: 'Response Time', target: kpiTargets.responseTime },
  { key: 'pmCompliance', label: 'PM Compliance', target: kpiTargets.pmCompliance },
  { key: 'woCompletion', label: 'WO Completion', target: kpiTargets.woCompletion },
  { key: 'slaAdherence', label: 'SLA Adherence', target: kpiTargets.slaAdherence },
] as const;

const formatRM = (value: number) =>
  `RM ${value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function KPIDashboard() {
  const theme = useTheme();
  const { kpiMonthlyRecords } = useStore();
  const [contractValue, setContractValue] = useState('2500000');
  const [deductionRatePerPoint, setDeductionRatePerPoint] = useState('0.04');

  const sortedMonthlyRecords = useMemo(
    () => kpiMonthlyRecords.slice().sort((a, b) => a.month.localeCompare(b.month)),
    [kpiMonthlyRecords]
  );
  const latestRecord = sortedMonthlyRecords[sortedMonthlyRecords.length - 1];

  const apdComputation = useMemo(() => {
    if (!latestRecord) {
      return { shortfallPoints: 0, calculatedDeduction: 0 };
    }

    const shortfallPoints = metricConfig.reduce((sum, metric) => {
      const currentValue = latestRecord[metric.key];
      return sum + Math.max(metric.target - currentValue, 0);
    }, 0);

    const parsedContractValue = Number.parseFloat(contractValue);
    const parsedDeductionRate = Number.parseFloat(deductionRatePerPoint);

    if (!Number.isFinite(parsedContractValue) || !Number.isFinite(parsedDeductionRate)) {
      return { shortfallPoints, calculatedDeduction: 0 };
    }

    const calculatedDeduction = (parsedContractValue * parsedDeductionRate * shortfallPoints) / 100;
    return { shortfallPoints, calculatedDeduction };
  }, [contractValue, deductionRatePerPoint, latestRecord]);

  const chartData = useMemo(
    () =>
      sortedMonthlyRecords.map((record) => ({
        month: format(new Date(`${record.month}-01T00:00:00`), 'MMM yy'),
        PM: record.pmCompliance,
        WO: record.woCompletion,
        SLA: record.slaAdherence,
      })),
    [sortedMonthlyRecords]
  );

  const handleExport = () => {
    const header = ['Month', 'CSS', 'Customer Rating', 'Response Time', 'PM Compliance', 'WO Completion', 'SLA Adherence', 'APD Deduction RM'];
    const rows = sortedMonthlyRecords.map((record) => [
      record.month,
      record.css,
      record.customerRating,
      record.responseTime,
      record.pmCompliance,
      record.woCompletion,
      record.slaAdherence,
      record.apdDeductionRM,
    ]);

    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `jkr-kpi-summary-${format(new Date(), 'yyyyMMdd')}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>KPI Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            JKR KPI monitoring with APD deduction calculator and monthly performance summary
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<ExportIcon />} onClick={handleExport}>
          Export Summary
        </Button>
      </Box>

      <AnimatedPanel delay={1}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metricConfig.map((metric) => {
          const currentValue = latestRecord ? latestRecord[metric.key] : 0;
          const passTarget = currentValue >= metric.target;

          return (
            <Grid key={metric.key} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: passTarget ? theme.palette.success.main : theme.palette.warning.main,
                      mt: 0.5,
                    }}
                  >
                    {currentValue}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Target: {metric.target}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      </AnimatedPanel>

      <AnimatedPanel delay={2}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendIcon fontSize="small" /> Monthly KPI Trend
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="PM" type="monotone" stroke={theme.palette.primary.main} strokeWidth={2} />
                    <Line dataKey="WO" type="monotone" stroke={theme.palette.success.main} strokeWidth={2} />
                    <Line dataKey="SLA" type="monotone" stroke={theme.palette.warning.main} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalculatorIcon fontSize="small" /> APD Deduction Calculator
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Contract Value"
                value={contractValue}
                onChange={(event) => setContractValue(event.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">RM</InputAdornment> }}
                sx={{ mb: 1.5 }}
              />

              <TextField
                fullWidth
                size="small"
                label="Deduction Rate / Point"
                value={deductionRatePerPoint}
                onChange={(event) => setDeductionRatePerPoint(event.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                sx={{ mb: 2 }}
              />

              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Shortfall Points</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{apdComputation.shortfallPoints.toFixed(1)}</Typography>
                <Typography variant="caption" color="text.secondary">Estimated APD Deduction</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                  {formatRM(apdComputation.calculatedDeduction)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest recorded APD: {formatRM(latestRecord?.apdDeductionRM || 0)}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </AnimatedPanel>

      <AnimatedPanel delay={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <KpiIcon fontSize="small" /> Monthly Summary
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">CSS</TableCell>
                  <TableCell align="right">Customer Rating</TableCell>
                  <TableCell align="right">Response Time</TableCell>
                  <TableCell align="right">PM Compliance</TableCell>
                  <TableCell align="right">WO Completion</TableCell>
                  <TableCell align="right">SLA Adherence</TableCell>
                  <TableCell align="right">APD Deduction</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMonthlyRecords
                  .slice()
                  .reverse()
                  .map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{format(new Date(`${record.month}-01T00:00:00`), 'MMM yyyy')}</TableCell>
                      <TableCell align="right">{record.css}%</TableCell>
                      <TableCell align="right">{record.customerRating}%</TableCell>
                      <TableCell align="right">{record.responseTime}%</TableCell>
                      <TableCell align="right">{record.pmCompliance}%</TableCell>
                      <TableCell align="right">{record.woCompletion}%</TableCell>
                      <TableCell align="right">{record.slaAdherence}%</TableCell>
                      <TableCell align="right">{formatRM(record.apdDeductionRM)}</TableCell>
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
