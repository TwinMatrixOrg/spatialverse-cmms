import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  TextField,
  Button,
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfMonth, subDays, subMonths } from 'date-fns';
import { contractors, pmSchedules, getAssetById, sites, workOrders, assets, RootCause } from '../data/mockData';
import { useStore } from '../store/useStore';

const woTrendData = [
  { date: 'Mon', created: 12, completed: 8 },
  { date: 'Tue', created: 15, completed: 14 },
  { date: 'Wed', created: 8, completed: 10 },
  { date: 'Thu', created: 18, completed: 12 },
  { date: 'Fri', created: 14, completed: 16 },
  { date: 'Sat', created: 6, completed: 8 },
  { date: 'Sun', created: 4, completed: 5 },
];

const mttrByAssetType = [
  { type: 'HVAC', mttr: 4.2, count: 25 },
  { type: 'Electrical', mttr: 2.8, count: 18 },
  { type: 'Plumbing', mttr: 3.5, count: 12 },
  { type: 'Fire Safety', mttr: 1.5, count: 8 },
  { type: 'Elevator', mttr: 6.2, count: 15 },
  { type: 'IT/AV', mttr: 2.1, count: 6 },
];

const faultCategories = [
  { name: 'Mechanical', value: 35 },
  { name: 'Electrical', value: 25 },
  { name: 'Control System', value: 15 },
  { name: 'Preventive', value: 12 },
  { name: 'Environmental', value: 8 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#29B6F6', '#FFA726', '#66BB6A', '#AB47BC', '#EF5350', '#78909C'];

const rootCauseLabelMap: Record<RootCause, string> = {
  age_wear: 'Age / Wear',
  abuse_misuse: 'Abuse / Misuse',
  design_flaw: 'Design Flaw',
  installation_error: 'Installation Error',
  environmental: 'Environmental',
  unknown: 'Unknown',
};

const rootCauseColors: Record<RootCause, string> = {
  age_wear: '#66BB6A',
  abuse_misuse: '#EF5350',
  design_flaw: '#AB47BC',
  installation_error: '#FFA726',
  environmental: '#29B6F6',
  unknown: '#78909C',
};

const pmComplianceTrend = [
  { month: 'Nov', compliance: 60 },
  { month: 'Dec', compliance: 63 },
  { month: 'Jan', compliance: 67 },
  { month: 'Feb', compliance: 71 },
  { month: 'Mar', compliance: 75 },
  { month: 'Apr', compliance: 78 },
];

const overduePMByCategory = [
  { category: 'HVAC', overdue: 4 },
  { category: 'Electrical', overdue: 2 },
  { category: 'Plumbing', overdue: 1 },
  { category: 'Fire Safety', overdue: 0 },
  { category: 'Elevator', overdue: 1 },
];

const overduePMRows = [
  { asset: 'AHU-PKL-02', location: 'Pavilion KL - B2', daysOverdue: 14, assignedTeam: 'HVAC Team A' },
  { asset: 'Chiller-SP-02', location: 'Sunway Pyramid - Plant Room', daysOverdue: 9, assignedTeam: 'HVAC Team B' },
  { asset: 'MDB-MV-01', location: 'Mid Valley Megamall - B3', daysOverdue: 7, assignedTeam: 'Electrical Team A' },
  { asset: 'Lift-PKL-02', location: 'Pavilion KL - Main Lobby', daysOverdue: 5, assignedTeam: 'Vertical Transport Team' },
  { asset: 'WaterPump-PKL-01', location: 'Pavilion KL - Pump Room', daysOverdue: 4, assignedTeam: 'Plumbing Team A' },
  { asset: 'Fire Suppression Zone-C', location: 'Pavilion KL - L4', daysOverdue: 3, assignedTeam: 'Fire Safety Team' },
];

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatRM = (value: number) =>
  `RM ${value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Reports() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState<string>(formatDateForInput(subDays(new Date(), 30)));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(new Date()));
  const workOrders = useStore((state) => state.workOrders);

  const rangeStart = new Date(startDate);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(endDate);
  rangeEnd.setHours(23, 59, 59, 999);

  const handleExportCSV = useCallback(() => {
    const filtered = workOrders.filter((wo) => isWithinRange(wo.createdAt));
    const headers = ['WO Number', 'Title', 'Status', 'Priority', 'Assigned To', 'Created', 'Resolved', 'Total Cost (RM)'];
    const rows = filtered.map((wo) => [
      wo.number,
      `"${wo.title}"`,
      wo.status,
      wo.priority,
      wo.assignedToId || '-',
      wo.createdAt ? format(new Date(wo.createdAt), 'yyyy-MM-dd') : '-',
      wo.resolvedAt ? format(new Date(wo.resolvedAt), 'yyyy-MM-dd') : '-',
      (wo.totalCost || 0).toFixed(2),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [workOrders, startDate, endDate]);

  const isWithinRange = (dateString: string) => {
    const entryDate = new Date(dateString);
    return entryDate >= rangeStart && entryDate <= rangeEnd;
  };

  const getWorkOrderCostInRange = (workOrder: (typeof workOrders)[number]) => {
    const labourCost = (workOrder.labourEntries || [])
      .filter((entry) => isWithinRange(entry.date))
      .reduce((sum, entry) => sum + entry.hours * entry.ratePerHour, 0);
    const partsCost = (workOrder.partsUsed || [])
      .filter((entry) => isWithinRange(entry.date))
      .reduce((sum, entry) => sum + entry.quantity * entry.unitCost, 0);
    return labourCost + partsCost;
  };

  const costPerSite = sites
    .map((site) => {
      const totalCost = workOrders
        .filter((workOrder) => workOrder.siteId === site.id)
        .reduce((sum, workOrder) => sum + getWorkOrderCostInRange(workOrder), 0);

      return {
        site: site.name,
        totalCost: Number(totalCost.toFixed(2)),
      };
    })
    .filter((siteCost) => siteCost.totalCost > 0)
    .sort((a, b) => b.totalCost - a.totalCost);

  const topCostAssets = Array.from(
    workOrders.reduce<Map<string, number>>((accumulator, workOrder) => {
      const cost = getWorkOrderCostInRange(workOrder);
      if (cost <= 0) {
        return accumulator;
      }

      const previous = accumulator.get(workOrder.assetId) || 0;
      accumulator.set(workOrder.assetId, previous + cost);
      return accumulator;
    }, new Map())
  )
    .map(([assetId, totalCost]) => ({
      asset: getAssetById(assetId)?.name || assetId,
      totalCost: Number(totalCost.toFixed(2)),
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5);

  // Calculate real metrics from mock data
  const totalWOs = workOrders.length;
  const completedWOs = workOrders.filter((wo) => ['resolved', 'closed'].includes(wo.status)).length;
  const completionRate = Math.round((completedWOs / totalWOs) * 100);

  const resolvedWOs = workOrders.filter((wo) => wo.resolvedAt);
  const avgMTTR = resolvedWOs.length > 0
    ? Math.round(
        resolvedWOs.reduce((sum, wo) => {
          const created = new Date(wo.createdAt).getTime();
          const resolved = new Date(wo.resolvedAt!).getTime();
          return sum + (resolved - created) / (1000 * 60 * 60);
        }, 0) / resolvedWOs.length * 10
      ) / 10
    : 0;

  const pmComplianceRate = Math.round(
    (pmSchedules.filter((pm) => pm.status === 'done').length / pmSchedules.length) * 100
  );

  const topPerformingContractor = [...contractors].sort(
    (a, b) => b.performanceScore - a.performanceScore
  )[0];

  const totalPPMTasksThisMonth = 36;
  const completedPPMTasksThisMonth = 28;
  const overduePPMTasksThisMonth = 8;
  const ppmComplianceThisMonth = Math.round((completedPPMTasksThisMonth / totalPPMTasksThisMonth) * 100);

  const failureEvents = useMemo(
    () =>
      assets.flatMap((asset) =>
        (asset.failureHistory || []).map((failureEvent) => ({
          ...failureEvent,
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          mtbfDays: asset.mtbfDays,
        }))
      ),
    []
  );

  const rootCauseDistribution = useMemo(() => {
    const rootCauseCounts: Record<RootCause, number> = {
      age_wear: 0,
      abuse_misuse: 0,
      design_flaw: 0,
      installation_error: 0,
      environmental: 0,
      unknown: 0,
    };

    workOrders
      .filter((workOrder) => ['resolved', 'closed'].includes(workOrder.status) && workOrder.rootCause)
      .forEach((workOrder) => {
        rootCauseCounts[workOrder.rootCause as RootCause] += 1;
      });

    return (Object.keys(rootCauseCounts) as RootCause[])
      .map((rootCause) => ({
        name: rootCauseLabelMap[rootCause],
        value: rootCauseCounts[rootCause],
        color: rootCauseColors[rootCause],
      }))
      .filter((entry) => entry.value > 0);
  }, []);

  const mtbfByAssetTypeData = useMemo(() => {
    const grouped = assets.reduce<Record<string, number[]>>((acc, asset) => {
      if (typeof asset.mtbfDays !== 'number') {
        return acc;
      }

      if (!acc[asset.type]) {
        acc[asset.type] = [];
      }

      acc[asset.type].push(asset.mtbfDays);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([type, mtbfValues]) => ({
        type,
        mtbfDays: Math.round(mtbfValues.reduce((sum, value) => sum + value, 0) / mtbfValues.length),
      }))
      .sort((assetTypeA, assetTypeB) => assetTypeA.mtbfDays - assetTypeB.mtbfDays);
  }, []);

  const monthlyFailureCountData = useMemo(() => {
    const monthStarts = Array.from({ length: 6 }, (_, index) => startOfMonth(subMonths(new Date(), 5 - index)));

    return monthStarts.map((monthStart, index) => {
      const nextMonthStart =
        index === monthStarts.length - 1
          ? startOfMonth(subMonths(monthStart, -1))
          : monthStarts[index + 1];

      const failureCount = failureEvents.filter((failureEvent) => {
        const eventTime = new Date(failureEvent.date).getTime();
        return eventTime >= monthStart.getTime() && eventTime < nextMonthStart.getTime();
      }).length;

      return {
        month: format(monthStart, 'MMM'),
        failures: failureCount,
      };
    });
  }, [failureEvents]);

  const topFailingAssets = useMemo(() => {
    return assets
      .map((asset) => {
        const failureHistory = asset.failureHistory || [];
        const lastFailureDate =
          failureHistory.length > 0
            ? [...failureHistory].sort(
                (failureEventA, failureEventB) =>
                  new Date(failureEventB.date).getTime() - new Date(failureEventA.date).getTime()
              )[0].date
            : null;

        return {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          failures: failureHistory.length,
          mtbfDays: asset.mtbfDays,
          lastFailureDate,
        };
      })
      .filter((asset) => asset.failures > 0)
      .sort((assetA, assetB) => {
        if (assetB.failures !== assetA.failures) {
          return assetB.failures - assetA.failures;
        }

        return (assetA.mtbfDays ?? Number.MAX_SAFE_INTEGER) - (assetB.mtbfDays ?? Number.MAX_SAFE_INTEGER);
      })
      .slice(0, 5);
  }, []);

  return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analytics and performance metrics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ width: 160 }}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ width: 160 }}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV} size="small">
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Summary KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  WO Completion Rate
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {completionRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {completedWOs} of {totalWOs} completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Average MTTR
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {avgMTTR}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mean Time To Repair
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  PM Compliance
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {pmComplianceRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  On-time completion
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Top Contractor
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {topPerformingContractor?.companyName.split(' ')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {topPerformingContractor?.performanceScore}% performance score
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="Work Orders" />
          <Tab label="MTTR Analysis" />
          <Tab label="Fault Categories" />
          <Tab label="Contractor Performance" />
          <Tab label="PPM Compliance" />
          <Tab label="Failure Analysis" />
        </Tabs>

        {/* Work Orders Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Work Order Trend (Last 7 Days)
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={woTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="created"
                          name="Created"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          dot={{ fill: theme.palette.primary.main }}
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          name="Completed"
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                          dot={{ fill: theme.palette.success.main }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    WO by Priority
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'P1 Critical', value: workOrders.filter((w) => w.priority === 'P1').length },
                            { name: 'P2 High', value: workOrders.filter((w) => w.priority === 'P2').length },
                            { name: 'P3 Medium', value: workOrders.filter((w) => w.priority === 'P3').length },
                            { name: 'P4 Low', value: workOrders.filter((w) => w.priority === 'P4').length },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {['#EF5350', '#FFA726', '#FFEE58', '#66BB6A'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                Cost Analysis
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Cost per Site
                  </Typography>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costPerSite} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis
                          type="number"
                          stroke={theme.palette.text.secondary}
                          tickFormatter={(value: number) => `RM ${value.toLocaleString('en-MY')}`}
                        />
                        <YAxis dataKey="site" type="category" width={120} stroke={theme.palette.text.secondary} />
                        <Tooltip formatter={(value: number) => [formatRM(value), 'Cost']} />
                        <Bar dataKey="totalCost" fill={theme.palette.primary.main} radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Top 5 Most Expensive Assets
                  </Typography>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topCostAssets} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis
                          type="number"
                          stroke={theme.palette.text.secondary}
                          tickFormatter={(value: number) => `RM ${value.toLocaleString('en-MY')}`}
                        />
                        <YAxis dataKey="asset" type="category" width={140} stroke={theme.palette.text.secondary} />
                        <Tooltip formatter={(value: number) => [formatRM(value), 'Cost']} />
                        <Bar dataKey="totalCost" fill={theme.palette.error.main} radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* MTTR Analysis Tab */}
        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                MTTR by Asset Type
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mttrByAssetType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis type="number" unit="h" stroke={theme.palette.text.secondary} />
                    <YAxis dataKey="type" type="category" width={100} stroke={theme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                      formatter={(value: number) => [`${value}h`, 'MTTR']}
                    />
                    <Bar dataKey="mttr" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]}>
                      {mttrByAssetType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Fault Categories Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Fault Categories Distribution
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={faultCategories}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {faultCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Fault Categories Breakdown
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={faultCategories}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {faultCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Contractor Performance Tab */}
        {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Contractor Performance Comparison
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contractors
                      .sort((a, b) => b.performanceScore - a.performanceScore)
                      .slice(0, 8)
                      .map((c) => ({
                        name: c.companyName.split(' ')[0],
                        performance: c.performanceScore,
                        completion: c.completionRate,
                        response: c.avgResponseTime,
                      }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="performance" name="Performance %" fill={theme.palette.primary.main} />
                    <Bar dataKey="completion" name="Completion %" fill={theme.palette.success.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total PPM Tasks (This Month)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalPPMTasksThisMonth}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Completed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {completedPPMTasksThisMonth}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Overdue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {overduePPMTasksThisMonth}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Compliance %
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {ppmComplianceThisMonth}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    PM Compliance % (Last 6 Months)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pmComplianceTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                        <YAxis domain={[50, 85]} stroke={theme.palette.text.secondary} unit="%" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="compliance"
                          stroke={theme.palette.primary.main}
                          strokeWidth={3}
                          dot={{ fill: theme.palette.primary.main, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Overdue PMs by Asset Category
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overduePMByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="category" stroke={theme.palette.text.secondary} />
                        <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} />
                        <Tooltip />
                        <Bar dataKey="overdue" fill={theme.palette.error.main} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Overdue PM Task List
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Asset</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Days Overdue</TableCell>
                          <TableCell>Assigned Team</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {overduePMRows.map((row) => (
                          <TableRow key={`${row.asset}-${row.location}`}>
                            <TableCell>{row.asset}</TableCell>
                            <TableCell>{row.location}</TableCell>
                            <TableCell>{row.daysOverdue}</TableCell>
                            <TableCell>{row.assignedTeam}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                color="error"
                                label="Overdue"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 5 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Root Cause Distribution
                  </Typography>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rootCauseDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {rootCauseDistribution.map((entry, index) => (
                            <Cell key={`rca-root-cause-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    MTBF by Asset Type
                  </Typography>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mtbfByAssetTypeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="type" stroke={theme.palette.text.secondary} />
                        <YAxis unit="d" stroke={theme.palette.text.secondary} />
                        <Tooltip formatter={(value: number) => [`${value} days`, 'MTBF']} />
                        <Bar dataKey="mtbfDays" name="MTBF" radius={[6, 6, 0, 0]} fill={theme.palette.success.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Monthly Failure Count (Last 6 Months)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyFailureCountData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                        <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} />
                        <Tooltip formatter={(value: number) => [value, 'Failures']} />
                        <Bar dataKey="failures" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Top 5 Failing Assets
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Asset</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Failures</TableCell>
                          <TableCell align="right">MTBF</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topFailingAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {asset.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {asset.lastFailureDate
                                  ? `Last: ${format(new Date(asset.lastFailureDate), 'MMM d, yyyy')}`
                                  : 'No failure date'}
                              </Typography>
                            </TableCell>
                            <TableCell>{asset.type}</TableCell>
                            <TableCell align="right">{asset.failures}</TableCell>
                            <TableCell align="right">{asset.mtbfDays ? `${asset.mtbfDays}d` : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
  );
}
