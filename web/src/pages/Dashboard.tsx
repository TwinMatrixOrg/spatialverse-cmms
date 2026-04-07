import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid2 as Grid,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as WorkOrderIcon,
  Warning as WarningIcon,
  Inventory2 as AssetIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  Build as BuildIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore } from '../store/useStore';
import {
  getDashboardKPIs,
  getWorkOrdersByStatusCount,
  workOrders,
  assets,
  pmSchedules,
  alerts,
  getUserById,
  getAssetById,
  getSiteById,
  sites,
} from '../data/mockData';
import { formatDistanceToNow, differenceInHours, differenceInMinutes, addDays } from 'date-fns';

const priorityColors = {
  P1: '#EF5350',
  P2: '#FFA726',
  P3: '#FFEE58',
  P4: '#66BB6A',
};

const statusColors = {
  open: '#29B6F6',
  assigned: '#AB47BC',
  in_progress: '#FFA726',
  pending_parts: '#78909C',
  resolved: '#66BB6A',
  closed: '#90A4AE',
};

const healthColors = {
  critical: '#EF5350',
  warning: '#FFA726',
  good: '#66BB6A',
};

function useSLACountdown(deadline: string) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setIsOverdue(true);
        const overdue = Math.abs(diff);
        const hours = Math.floor(overdue / (1000 * 60 * 60));
        const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`-${hours}h ${minutes}m`);
      } else {
        setIsOverdue(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return { timeLeft, isOverdue };
}

function KPICard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color, lineHeight: 1.1, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.3 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem', display: 'block', mt: 0.3 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.12),
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              '& .MuiSvgIcon-root': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function SLABadge({ deadline, status }: { deadline: string; status: string }) {
  const { timeLeft, isOverdue } = useSLACountdown(deadline);

  if (['resolved', 'closed'].includes(status)) {
    return null;
  }

  return (
    <Chip
      size="small"
      icon={<TimeIcon sx={{ fontSize: 14 }} />}
      label={timeLeft}
      sx={{
        backgroundColor: isOverdue ? alpha('#EF5350', 0.1) : alpha('#66BB6A', 0.1),
        color: isOverdue ? '#EF5350' : '#66BB6A',
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 24,
      }}
    />
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { selectedSiteId } = useStore();

  const kpis = getDashboardKPIs(selectedSiteId || undefined);
  const woByStatus = getWorkOrdersByStatusCount(selectedSiteId || undefined);

  const pieData = [
    { name: 'Open', value: woByStatus.open, color: statusColors.open },
    { name: 'Assigned', value: woByStatus.assigned, color: statusColors.assigned },
    { name: 'In Progress', value: woByStatus.inProgress, color: statusColors.in_progress },
    { name: 'Pending Parts', value: woByStatus.pendingParts, color: statusColors.pending_parts },
    { name: 'Resolved', value: woByStatus.resolved, color: statusColors.resolved },
    { name: 'Closed', value: woByStatus.closed, color: statusColors.closed },
  ].filter(d => d.value > 0);

  const recentWOs = workOrders
    .filter(wo => !selectedSiteId || wo.siteId === selectedSiteId)
    .filter(wo => !['closed'].includes(wo.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const upcomingPMs = pmSchedules
    .filter(pm => !selectedSiteId || pm.siteId === selectedSiteId)
    .filter(pm => pm.status !== 'done')
    .filter(pm => new Date(pm.nextDueDate) <= addDays(new Date(), 7))
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 5);

  const activeAlerts = alerts
    .filter(a => ['critical', 'warning'].includes(a.severity))
    .slice(0, 5);

  const filteredAssets = selectedSiteId
    ? assets.filter(a => a.siteId === selectedSiteId)
    : assets;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const selectedSite = selectedSiteId ? sites.find(s => s.id === selectedSiteId) : null;
    const center: [number, number] = selectedSite
      ? [selectedSite.location.lng, selectedSite.location.lat]
      : [101.6773, 3.1178];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center,
      zoom: selectedSite ? 16 : 11,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add asset markers
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.querySelectorAll('.asset-marker');
    markers.forEach(m => m.remove());

    // Add new markers
    filteredAssets.forEach(asset => {
      const markerEl = document.createElement('div');
      markerEl.className = 'asset-marker';
      markerEl.style.width = '24px';
      markerEl.style.height = '24px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.border = '3px solid white';
      markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      markerEl.style.backgroundColor = healthColors[asset.healthStatus];

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <strong style="font-size: 14px;">${asset.name}</strong>
          <div style="font-size: 12px; color: #666; margin-top: 2px;">${asset.type}</div>
          <div style="font-size: 12px; margin-top: 4px;">
            Health: <span style="color: ${healthColors[asset.healthStatus]}; font-weight: 600;">${asset.healthScore}%</span>
          </div>
          ${asset.openWorkOrdersCount > 0 ? `<div style="font-size: 12px; color: #EF5350;">Open WOs: ${asset.openWorkOrdersCount}</div>` : ''}
        </div>
      `);

      new maplibregl.Marker({ element: markerEl })
        .setLngLat([asset.location.lng, asset.location.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Fit bounds if multiple assets
    if (filteredAssets.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      filteredAssets.forEach(asset => {
        bounds.extend([asset.location.lng, asset.location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (filteredAssets.length === 1) {
      map.current.flyTo({
        center: [filteredAssets[0].location.lng, filteredAssets[0].location.lat],
        zoom: 16,
      });
    }
  }, [filteredAssets, selectedSiteId]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Dashboard
      </Typography>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'nowrap' }}>
        {[
          { title: 'Open Work Orders', value: kpis.openWorkOrders, icon: <WorkOrderIcon />, color: theme.palette.primary.main },
          { title: 'Overdue WOs', value: kpis.overdueWorkOrders, icon: <WarningIcon />, color: theme.palette.error.main },
          { title: 'Total Assets', value: kpis.totalAssets, subtitle: `${kpis.criticalAssets} critical`, icon: <AssetIcon />, color: theme.palette.secondary.main },
          { title: 'PM Compliance', value: `${kpis.pmComplianceRate}%`, icon: <CheckIcon />, color: theme.palette.success.main },
          { title: 'MTTR', value: `${kpis.mttr}h`, subtitle: 'Avg repair time', icon: <BuildIcon />, color: theme.palette.info.main },
        ].map((kpi) => (
          <Box key={kpi.title} sx={{ flex: '1 1 0', minWidth: 0 }}>
            <KPICard {...kpi} />
          </Box>
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* WO Status Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 360 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Work Order Status
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {pieData.map((entry) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: entry.color,
                      }}
                    />
                    <Typography variant="caption">
                      {entry.name} ({entry.value})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Map */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: 360 }}>
            <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
              <Box
                ref={mapContainer}
                sx={{
                  width: '100%', height: '100%', borderRadius: 3,
                  '& .maplibregl-ctrl-attrib': { display: 'none' },
                  '& .maplibregl-ctrl-logo': { display: 'none' },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Work Orders */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 420 }}>
            <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Work Orders
                </Typography>
              </Box>
              <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                {recentWOs.map((wo, index) => {
                  const asset = getAssetById(wo.assetId);
                  const site = getSiteById(wo.siteId);
                  return (
                    <Box key={wo.id}>
                      <ListItem sx={{ py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: alpha(priorityColors[wo.priority], 0.15),
                              color: priorityColors[wo.priority],
                              width: 40,
                              height: 40,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {wo.priority}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight={600}>
                                {wo.number}
                              </Typography>
                              <Chip
                                size="small"
                                label={wo.status.replace('_', ' ')}
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  textTransform: 'capitalize',
                                  backgroundColor: alpha(statusColors[wo.status as keyof typeof statusColors], 0.15),
                                  color: statusColors[wo.status as keyof typeof statusColors],
                                }}
                              />
                              <SLABadge deadline={wo.slaDeadline} status={wo.status} />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {asset?.name} - {wo.faultType}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {site?.name}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentWOs.length - 1 && <Divider component="li" />}
                    </Box>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming PM & Alerts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            {/* Upcoming PM */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ height: 200 }}>
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Upcoming PM (7 days)
                    </Typography>
                  </Box>
                  <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                    {upcomingPMs.map((pm) => {
                      const asset = getAssetById(pm.assetId);
                      const isOverdue = pm.status === 'overdue';
                      return (
                        <ListItem key={pm.id} sx={{ py: 1 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={500}>
                                {pm.name}
                              </Typography>
                            }
                            secondary={asset?.name}
                          />
                          <Chip
                            size="small"
                            label={isOverdue ? 'Overdue' : formatDistanceToNow(new Date(pm.nextDueDate), { addSuffix: true })}
                            sx={{
                              backgroundColor: isOverdue ? alpha('#EF5350', 0.1) : alpha('#FFA726', 0.1),
                              color: isOverdue ? '#EF5350' : '#FFA726',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                            }}
                          />
                        </ListItem>
                      );
                    })}
                    {upcomingPMs.length === 0 && (
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                              No upcoming PM schedules
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Active Alerts */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ height: 200 }}>
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Active Alerts
                    </Typography>
                    <Chip
                      size="small"
                      label={`${activeAlerts.length} active`}
                      color="error"
                      sx={{ height: 22 }}
                    />
                  </Box>
                  <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                    {activeAlerts.map((alert) => (
                      <ListItem
                        key={alert.id}
                        sx={{
                          py: 1,
                          borderLeft: `3px solid ${alert.severity === 'critical' ? '#EF5350' : '#FFA726'}`,
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <ErrorIcon
                            sx={{
                              color: alert.severity === 'critical' ? '#EF5350' : '#FFA726',
                              fontSize: 20,
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={500}>
                              {alert.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {alert.description}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
