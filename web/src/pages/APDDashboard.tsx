import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Button, TextField,
  Grid2 as Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Drawer, Divider, FormControl, InputLabel, Select, MenuItem,
  alpha, useTheme, LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import AnimatedPage, { AnimatedPanel } from '../components/AnimatedPage';

// ── APD Types ────────────────────────────────────────────────────
interface APDKPI {
  id: string;
  code: string;
  name: string;
  category: string;
  maxDeductionPercent: number;
  weight: number;
  monthlyScores: {
    month: string;
    score: number;
    remarks: string;
  }[];
}

interface APDSummary {
  period: string;
  contractValue: number;
  grossPayment: number;
  totalDeduction: number;
  netPayment: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ── Seed Data ────────────────────────────────────────────────────
const KPIs: APDKPI[] = [
  {
    id: 'kpi-1', code: 'APD-01', name: 'Response Time — Corrective Maintenance',
    category: 'Response', maxDeductionPercent: 5, weight: 15,
    monthlyScores: [
      { month: '2026-01', score: 92, remarks: 'All P1 WOs responded within SLA' },
      { month: '2026-02', score: 88, remarks: '2 P2 WOs delayed (weekend staffing)' },
      { month: '2026-03', score: 95, remarks: 'Excellent — no breaches' },
      { month: '2026-04', score: 90, remarks: '1 P1 delayed 15min (traffic)' },
    ],
  },
  {
    id: 'kpi-2', code: 'APD-02', name: 'Resolution Time — Corrective Maintenance',
    category: 'Response', maxDeductionPercent: 5, weight: 15,
    monthlyScores: [
      { month: '2026-01', score: 85, remarks: '3 WOs exceeded 48h resolution' },
      { month: '2026-02', score: 90, remarks: 'Improved after parts stocking' },
      { month: '2026-03', score: 87, remarks: 'Chiller compressor delayed (parts ordered)' },
      { month: '2026-04', score: 93, remarks: 'On track' },
    ],
  },
  {
    id: 'kpi-3', code: 'APD-03', name: 'Preventive Maintenance Compliance',
    category: 'PM', maxDeductionPercent: 10, weight: 25,
    monthlyScores: [
      { month: '2026-01', score: 98, remarks: 'All PMs on schedule' },
      { month: '2026-02', score: 100, remarks: 'Perfect month' },
      { month: '2026-03', score: 96, remarks: '1 PM deferred (access issue)' },
      { month: '2026-04', score: 94, remarks: '2 PMs pending — due next week' },
    ],
  },
  {
    id: 'kpi-4', code: 'APD-04', name: 'System Availability (Critical Systems)',
    category: 'Uptime', maxDeductionPercent: 10, weight: 20,
    monthlyScores: [
      { month: '2026-01', score: 99.5, remarks: 'Elevator downtime 2h (scheduled maintenance)' },
      { month: '2026-02', score: 99.8, remarks: 'Near-perfect uptime' },
      { month: '2026-03', score: 98.2, remarks: 'AC failure Block B — 4h unplanned' },
      { month: '2026-04', score: 99.9, remarks: 'No unplanned downtime' },
    ],
  },
  {
    id: 'kpi-5', code: 'APD-05', name: 'Cleanliness & Housekeeping Score',
    category: 'Housekeeping', maxDeductionPercent: 5, weight: 10,
    monthlyScores: [
      { month: '2026-01', score: 88, remarks: 'Minor issues in B1 carpark' },
      { month: '2026-02', score: 92, remarks: 'Improved after deep clean' },
      { month: '2026-03', score: 90, remarks: 'Pantries need more frequent checks' },
      { month: '2026-04', score: 95, remarks: 'Overall good' },
    ],
  },
  {
    id: 'kpi-6', code: 'APD-06', name: 'Safety & Compliance',
    category: 'Safety', maxDeductionPercent: 5, weight: 15,
    monthlyScores: [
      { month: '2026-01', score: 100, remarks: 'No incidents' },
      { month: '2026-02', score: 95, remarks: 'Minor near-miss — reported and addressed' },
      { month: '2026-03', score: 100, remarks: 'No incidents' },
      { month: '2026-04', score: 100, remarks: 'No incidents' },
    ],
  },
];

const MONTHLY_SUMMARY: APDSummary[] = [
  { period: 'Jan 2026', contractValue: 285000, grossPayment: 23750, totalDeduction: 1188, netPayment: 22562, score: 95, grade: 'A' },
  { period: 'Feb 2026', contractValue: 285000, grossPayment: 23750, totalDeduction: 713, netPayment: 23037, score: 97, grade: 'A' },
  { period: 'Mar 2026', contractValue: 285000, grossPayment: 23750, totalDeduction: 1425, netPayment: 22325, score: 94, grade: 'A' },
  { period: 'Apr 2026', contractValue: 285000, grossPayment: 23750, totalDeduction: 475, netPayment: 23275, score: 98, grade: 'A' },
];

const GRADE_COLORS: Record<string, string> = {
  A: '#16a34a', B: '#2563eb', C: '#f59e0b', D: '#f97316', F: '#dc2626',
};

const GRADE_THRESHOLDS = 'A ≥95%, B ≥85%, C ≥75%, D ≥65%, F <65%';

export default function APDDashboard() {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<APDKPI | null>(null);

  const months = ['2026-01', '2026-02', '2026-03', '2026-04'];
  const currentMonth = MONTHLY_SUMMARY.find(m => m.period.includes(selectedMonth.replace('2026-', ''))) || MONTHLY_SUMMARY[3];

  // Calculate weighted score
  const weightedScore = KPIs.reduce((sum, kpi) => {
    const monthScore = kpi.monthlyScores.find(s => s.month === selectedMonth);
    return sum + ((monthScore?.score || 0) * kpi.weight / 100);
  }, 0);

  const totalDeduction = KPIs.reduce((sum, kpi) => {
    const monthScore = kpi.monthlyScores.find(s => s.month === selectedMonth);
    const score = monthScore?.score || 100;
    const deduction = score < 65 ? kpi.maxDeductionPercent : score < 75 ? kpi.maxDeductionPercent * 0.5 : score < 85 ? kpi.maxDeductionPercent * 0.25 : 0;
    return sum + deduction;
  }, 0);

  const openKPI = (kpi: APDKPI) => {
    setSelectedKPI(kpi);
    setDrawerOpen(true);
  };

  return (
    <AnimatedPage>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.65rem', sm: '2rem' } }}>
              APD Deduction Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Ascertained Performance Deduction — JKR Monthly KPI Scoring
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} label="Period">
                {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<DownloadIcon />} size="small" onClick={() => {
              // Export APD table as CSV
              const header = 'KPI Code,KPI Name,Category,Weight %,Score,Max Deduction %,Remarks\n';
              const rows = KPIs.map(kpi => {
                const ms = kpi.monthlyScores.find(s => s.month === selectedMonth);
                return `"${kpi.code}","${kpi.name}","${kpi.category}",${kpi.weight}%,${ms?.score || '—'},${kpi.maxDeductionPercent}%,"${ms?.remarks || ''}"`;
              }).join('\n');
              const summary = `\n\n"","","","","","",\n"Weighted Score",${weightedScore.toFixed(1)}%\n"Total Deduction",${totalDeduction.toFixed(1)}%\n"Net Payment",MYR ${(currentMonth.grossPayment - (currentMonth.grossPayment * totalDeduction / 100)).toLocaleString()}\n"Grade","${currentMonth.grade}"`;
              const blob = new Blob([header + rows + summary], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `APD-${selectedMonth}.csv`; a.click();
              URL.revokeObjectURL(url);
            }}>Export</Button>
          </Box>
        </Box>

        {/* Summary Cards */}
        <AnimatedPanel>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Weighted Score', value: `${weightedScore.toFixed(1)}%`, icon: <TrendingUpIcon />, color: '#16a34a' },
              { label: 'Total Deduction', value: `${totalDeduction.toFixed(1)}%`, icon: <WarningIcon />, color: totalDeduction > 5 ? '#dc2626' : '#f59e0b' },
              { label: 'Gross Payment', value: `MYR ${currentMonth.grossPayment.toLocaleString()}`, icon: <CheckIcon />, color: '#2563eb' },
              { label: 'Net Payment', value: `MYR ${(currentMonth.grossPayment - (currentMonth.grossPayment * totalDeduction / 100)).toLocaleString()}`, icon: <TrendingDownIcon />, color: '#8b5cf6' },
            ].map((stat, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <Card sx={{
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                  background: `linear-gradient(135deg, ${alpha(stat.color, 0.08)} 0%, transparent 60%)`,
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AnimatedPanel>

        {/* Grade Badge & Scoring Guide */}
        <AnimatedPanel delay={1}>
          <Card sx={{ mb: 3, border: `1px solid ${alpha(GRADE_COLORS[currentMonth.grade], 0.3)}`, background: alpha(GRADE_COLORS[currentMonth.grade], 0.04) }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, '&:last-child': { pb: 2 }, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: alpha(GRADE_COLORS[currentMonth.grade], 0.15), border: `2px solid ${GRADE_COLORS[currentMonth.grade]}`,
                }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: GRADE_COLORS[currentMonth.grade] }}>{currentMonth.grade}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Performance Grade — {currentMonth.period}</Typography>
                  <Typography variant="body2" color="text.secondary">Based on 6 KPIs, weighted score {weightedScore.toFixed(1)}%</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">{GRADE_THRESHOLDS}</Typography>
            </CardContent>
          </Card>
        </AnimatedPanel>

        {/* Monthly Trend */}
        <AnimatedPanel delay={1}>
          <Card sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Monthly Payment Summary</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Gross Payment</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Deduction</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Net Payment</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Score</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {MONTHLY_SUMMARY.map(ms => (
                      <TableRow key={ms.period} hover sx={{ bgcolor: ms.period === currentMonth.period ? alpha(theme.palette.primary.main, 0.06) : 'inherit' }}>
                        <TableCell><Typography variant="body2" fontWeight={ms.period === currentMonth.period ? 700 : 400}>{ms.period}</Typography></TableCell>
                        <TableCell align="right">MYR {ms.grossPayment.toLocaleString()}</TableCell>
                        <TableCell align="right"><Typography color={ms.totalDeduction > 1000 ? 'error.main' : 'text.primary'}>MYR {ms.totalDeduction.toLocaleString()}</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={600}>MYR {ms.netPayment.toLocaleString()}</Typography></TableCell>
                        <TableCell align="center"><Chip size="small" label={`${ms.score}%`} sx={{ bgcolor: alpha('#16a34a', 0.1), color: '#16a34a', fontWeight: 600 }} /></TableCell>
                        <TableCell align="center">
                          <Box sx={{
                            width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: alpha(GRADE_COLORS[ms.grade], 0.15), border: `1.5px solid ${GRADE_COLORS[ms.grade]}`,
                          }}>
                            <Typography variant="caption" fontWeight={800} sx={{ color: GRADE_COLORS[ms.grade] }}>{ms.grade}</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </AnimatedPanel>

        {/* KPI Scoring Table */}
        <AnimatedPanel delay={2}>
          <Card sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ p: 2, pb: 1 }}>KPI Scoring — {selectedMonth}</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>KPI</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Weight</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Max Deduction</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {KPIs.map(kpi => {
                      const ms = kpi.monthlyScores.find(s => s.month === selectedMonth);
                      const score = ms?.score || 0;
                      const scoreColor = score >= 95 ? '#16a34a' : score >= 85 ? '#2563eb' : score >= 75 ? '#f59e0b' : '#dc2626';
                      return (
                        <TableRow key={kpi.id} hover sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) } }} onClick={() => openKPI(kpi)}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{kpi.code}</Typography>
                            <Typography variant="caption" color="text.secondary">{kpi.name}</Typography>
                          </TableCell>
                          <TableCell><Chip size="small" label={kpi.category} variant="outlined" /></TableCell>
                          <TableCell align="center">{kpi.weight}%</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress variant="determinate" value={score} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: alpha(scoreColor, 0.1), '& .MuiLinearProgress-bar': { bgcolor: scoreColor } }} />
                              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 36, color: scoreColor }}>{score}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{kpi.maxDeductionPercent}%</TableCell>
                          <TableCell><Typography variant="caption" color="text.secondary">{ms?.remarks || '—'}</Typography></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </AnimatedPanel>

        {/* KPI Detail Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
          {selectedKPI && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{selectedKPI.code}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedKPI.name}</Typography>
                </Box>
                <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedKPI.category}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Weight</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedKPI.weight}%</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Max Deduction</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedKPI.maxDeductionPercent}%</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Monthly Trend</Typography>

              {selectedKPI.monthlyScores.map(ms => {
                const sc = ms.score;
                const color = sc >= 95 ? '#16a34a' : sc >= 85 ? '#2563eb' : sc >= 75 ? '#f59e0b' : '#dc2626';
                return (
                  <Box key={ms.month} sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: ms.month === selectedMonth ? alpha(color, 0.08) : 'transparent', border: ms.month === selectedMonth ? `1px solid ${alpha(color, 0.2)}` : '1px solid transparent' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>{ms.month}</Typography>
                      <Chip size="small" label={`${sc}%`} sx={{ bgcolor: alpha(color, 0.15), color, fontWeight: 700 }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">{ms.remarks}</Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Drawer>
      </Box>
    </AnimatedPage>
  );
}
