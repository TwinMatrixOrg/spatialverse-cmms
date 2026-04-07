import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  TextField,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
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
import { subDays } from 'date-fns';
import { workOrders, assets, contractors, pmSchedules, getAssetById } from '../data/mockData';

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

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Reports() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState<string>(formatDateForInput(subDays(new Date(), 30)));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(new Date()));

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
      </Box>
  );
}
