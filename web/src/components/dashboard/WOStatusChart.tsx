import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getWorkOrdersByStatusCount } from '../../data/mockData';
import { useStore } from '../../store/useStore';

export default function WOStatusChart() {
  const theme = useTheme();
  const { selectedSiteId } = useStore();
  const statusCount = getWorkOrdersByStatusCount(selectedSiteId || undefined);

  const data = [
    { name: 'Open', value: statusCount.open, color: '#EF5350' },
    { name: 'Assigned', value: statusCount.assigned, color: '#29B6F6' },
    { name: 'In Progress', value: statusCount.inProgress, color: '#FFA726' },
    { name: 'Pending Parts', value: statusCount.pendingParts, color: '#AB47BC' },
    { name: 'Resolved', value: statusCount.resolved, color: '#66BB6A' },
    { name: 'Closed', value: statusCount.closed, color: '#78909C' },
  ].filter(d => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.value} work orders ({Math.round((data.value / total) * 100)}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Work Order Status
        </Typography>
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value: string) => (
                  <span style={{ color: theme.palette.text.primary, fontSize: 12 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ textAlign: 'center', mt: -2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Work Orders
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
