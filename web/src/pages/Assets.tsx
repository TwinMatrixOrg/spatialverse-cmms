import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Drawer,
  IconButton,
  Grid2 as Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Button,
  Avatar,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  QrCode2 as QRIcon,
  ViewList as ListIcon,
  Map as MapIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore, AssetHealthBand } from '../store/useStore';
import {
  assets,
  getSiteById,
  sites,
  Asset,
  AssetType,
  RootCause,
  WorkOrder,
  PMSchedule,
  calculateAssetHealth,
} from '../data/mockData';
import { format } from 'date-fns';

const assetTypes: AssetType[] = [
  'HVAC',
  'Electrical',
  'Plumbing',
  'Fire Safety',
  'Elevator',
  'Structural',
  'IT/AV',
  'General',
];

const healthColors = {
  critical: '#EF5350',
  warning: '#FFA726',
  good: '#66BB6A',
};

const getHealthStatus = (healthScore: number) => {
  if (healthScore < 40) return 'critical';
  if (healthScore < 70) return 'warning';
  return 'good';
};

const getHealthBand = (healthScore: number): Exclude<AssetHealthBand, 'all'> => {
  if (healthScore < 40) return 'critical';
  if (healthScore < 70) return 'at_risk';
  return 'healthy';
};

const typeColors: Record<AssetType, string> = {
  HVAC: '#29B6F6',
  Electrical: '#FFA726',
  Plumbing: '#66BB6A',
  'Fire Safety': '#EF5350',
  Elevator: '#AB47BC',
  Structural: '#78909C',
  'IT/AV': '#7C4DFF',
  General: '#90A4AE',
};

const rootCauseLabels: Record<RootCause, string> = {
  age_wear: 'Age / Wear',
  abuse_misuse: 'Abuse / Misuse',
  design_flaw: 'Design Flaw',
  installation_error: 'Installation Error',
  environmental: 'Environmental',
  unknown: 'Unknown',
};

const getMTBFMeta = (mtbfDays?: number) => {
  if (typeof mtbfDays !== 'number') {
    return {
      color: '#78909C',
      bg: alpha('#78909C', 0.14),
      label: 'MTBF: N/A',
    };
  }

  if (mtbfDays > 90) {
    return {
      color: '#66BB6A',
      bg: alpha('#66BB6A', 0.15),
      label: `MTBF: ${mtbfDays}d`,
    };
  }

  if (mtbfDays >= 30) {
    return {
      color: '#FFA726',
      bg: alpha('#FFA726', 0.15),
      label: `MTBF: ${mtbfDays}d`,
    };
  }

  return {
    color: '#EF5350',
    bg: alpha('#EF5350', 0.15),
    label: `MTBF: ${mtbfDays}d`,
  };
};

export default function Assets() {
  const theme = useTheme();
  const {
    selectedSiteId,
    workOrders,
    pmSchedules,
    assetHealthBandFilter,
    setAssetHealthBandFilter,
  } = useStore();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'table' | 'map'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | 'critical' | 'warning' | 'good'>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const getCalculatedHealthScore = (assetId: string) =>
    calculateAssetHealth(assetId, workOrders, pmSchedules);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const healthScore = getCalculatedHealthScore(asset.id);
      const healthStatus = getHealthStatus(healthScore);
      const healthBand = getHealthBand(healthScore);

      if (selectedSiteId && asset.siteId !== selectedSiteId) return false;
      if (typeFilter !== 'all' && asset.type !== typeFilter) return false;
      if (healthFilter !== 'all' && healthStatus !== healthFilter) return false;
      if (assetHealthBandFilter !== 'all' && assetHealthBandFilter !== healthBand) return false;
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          asset.name.toLowerCase().includes(search) ||
          asset.type.toLowerCase().includes(search) ||
          asset.description?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [
    selectedSiteId,
    typeFilter,
    healthFilter,
    searchQuery,
    assetHealthBandFilter,
    workOrders,
    pmSchedules,
  ]);

  const topFailingAssets = useMemo(() => {
    const scopedAssets = selectedSiteId ? assets.filter((asset) => asset.siteId === selectedSiteId) : assets;

    return scopedAssets
      .map((asset) => ({
        ...asset,
        failureCount: asset.failureHistory?.length || 0,
      }))
      .filter((asset) => asset.failureCount > 0)
      .sort((assetA, assetB) => {
        if (assetB.failureCount !== assetA.failureCount) {
          return assetB.failureCount - assetA.failureCount;
        }

        const mtbfA = assetA.mtbfDays ?? Number.MAX_SAFE_INTEGER;
        const mtbfB = assetB.mtbfDays ?? Number.MAX_SAFE_INTEGER;
        return mtbfA - mtbfB;
      })
      .slice(0, 5);
  }, [selectedSiteId]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (viewMode === 'table') return;

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
  }, [viewMode]);

  // Update markers
  useEffect(() => {
    if (!map.current || viewMode === 'table') return;

    // Remove existing markers
    const markers = document.querySelectorAll('.asset-marker');
    markers.forEach(m => m.remove());

    // Add new markers
    filteredAssets.forEach(asset => {
      const healthScore = getCalculatedHealthScore(asset.id);
      const healthStatus = getHealthStatus(healthScore);
      const openWorkOrderCount = workOrders.filter(
        (workOrder) =>
          workOrder.assetId === asset.id && !['resolved', 'closed'].includes(workOrder.status)
      ).length;

      const markerEl = document.createElement('div');
      markerEl.className = 'asset-marker';
      markerEl.style.width = '28px';
      markerEl.style.height = '28px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.border = '3px solid white';
      markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      markerEl.style.backgroundColor = healthColors[healthStatus];

      markerEl.onclick = () => setSelectedAsset(asset);

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <strong style="font-size: 14px;">${asset.name}</strong>
          <div style="font-size: 12px; color: #666; margin-top: 2px;">${asset.type}</div>
          <div style="font-size: 12px; margin-top: 4px;">
            Health: <span style="color: ${healthColors[healthStatus]}; font-weight: 600;">${healthScore}%</span>
          </div>
          ${openWorkOrderCount > 0 ? `<div style="font-size: 12px; color: #EF5350;">Open WOs: ${openWorkOrderCount}</div>` : ''}
        </div>
      `);

      new maplibregl.Marker({ element: markerEl })
        .setLngLat([asset.location.lng, asset.location.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Fit bounds
    if (filteredAssets.length > 1 && map.current) {
      const bounds = new maplibregl.LngLatBounds();
      filteredAssets.forEach(asset => {
        bounds.extend([asset.location.lng, asset.location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [filteredAssets, viewMode, workOrders, pmSchedules]);

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Assets
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Asset
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value as AssetType | 'all')}
          >
            <MenuItem value="all">All Types</MenuItem>
            {assetTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Health</InputLabel>
          <Select
            value={healthFilter}
            label="Health"
            onChange={(e) => setHealthFilter(e.target.value as 'all' | 'critical' | 'warning' | 'good')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="good">Good</MenuItem>
          </Select>
        </FormControl>
        <Chip
          label={`${filteredAssets.length} assets`}
          sx={{ alignSelf: 'center' }}
        />
        {assetHealthBandFilter !== 'all' && (
          <Chip
            label={`Dashboard filter: ${assetHealthBandFilter.replace('_', ' ')}`}
            color="primary"
            onDelete={() => setAssetHealthBandFilter('all')}
            sx={{ textTransform: 'capitalize' }}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
        >
          <ToggleButton value="split">Split</ToggleButton>
          <ToggleButton value="table">
            <ListIcon sx={{ mr: 0.5 }} /> Table
          </ToggleButton>
          <ToggleButton value="map">
            <MapIcon sx={{ mr: 0.5 }} /> Map
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Content */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Top Failing Assets
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Based on recorded failure history
            </Typography>
          </Box>
          {topFailingAssets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No failure history recorded for this scope.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {topFailingAssets.map((asset) => {
                const mtbfMeta = getMTBFMeta(asset.mtbfDays);

                return (
                  <Box
                    key={asset.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      minWidth: 180,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {asset.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      {asset.type} • {asset.failureCount} failures
                    </Typography>
                    <Chip
                      size="small"
                      label={mtbfMeta.label}
                      sx={{
                        backgroundColor: mtbfMeta.bg,
                        color: mtbfMeta.color,
                        fontWeight: 600,
                        height: 22,
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
        {/* Table */}
        {(viewMode === 'split' || viewMode === 'table') && (
          <TableContainer
            component={Paper}
            sx={{ flex: viewMode === 'split' ? '0 0 55%' : 1, overflow: 'auto' }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Asset</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Health</TableCell>
                  <TableCell>Open WOs</TableCell>
                  <TableCell>Last Service</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const site = getSiteById(asset.siteId);
                  const healthScore = getCalculatedHealthScore(asset.id);
                  const healthStatus = getHealthStatus(healthScore);
                  const openWorkOrderCount = workOrders.filter(
                    (workOrder) =>
                      workOrder.assetId === asset.id && !['resolved', 'closed'].includes(workOrder.status)
                  ).length;

                  return (
                    <TableRow
                      key={asset.id}
                      hover
                      onClick={() => setSelectedAsset(asset)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {asset.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.manufacturer} {asset.model}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={asset.type}
                          sx={{
                            backgroundColor: alpha(typeColors[asset.type], 0.15),
                            color: typeColors[asset.type],
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{site?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.floor} {asset.zone && `- ${asset.zone}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={healthScore}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(healthColors[healthStatus], 0.2),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: healthColors[healthStatus],
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography variant="caption" fontWeight={600} color={healthColors[healthStatus]}>
                            {healthScore}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {openWorkOrderCount > 0 ? (
                          <Chip
                            size="small"
                            label={openWorkOrderCount}
                            color="error"
                            sx={{ height: 22, minWidth: 28 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {asset.lastServiceDate
                            ? format(new Date(asset.lastServiceDate), 'MMM d, yyyy')
                            : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Map */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <Card sx={{ flex: viewMode === 'split' ? '0 0 45%' : 1, overflow: 'hidden' }}>
            <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />
          </Card>
        )}
      </Box>

      {/* Asset Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedAsset)}
        onClose={() => setSelectedAsset(null)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } },
        }}
      >
        {selectedAsset && (
          <AssetDetailPanel
            asset={selectedAsset}
            workOrders={workOrders}
            pmSchedules={pmSchedules}
            onClose={() => setSelectedAsset(null)}
          />
        )}
      </Drawer>
    </Box>
  );
}

function AssetDetailPanel({
  asset,
  workOrders,
  pmSchedules,
  onClose,
}: {
  asset: Asset;
  workOrders: WorkOrder[];
  pmSchedules: PMSchedule[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const site = getSiteById(asset.siteId);
  const assetWOs = workOrders.filter(wo => wo.assetId === asset.id);
  const assetPMs = pmSchedules.filter(pm => pm.assetId === asset.id);
  const healthScore = calculateAssetHealth(asset.id, workOrders, pmSchedules);
  const healthStatus = getHealthStatus(healthScore);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {asset.name}
          </Typography>
          <Chip
            size="small"
            label={asset.type}
            sx={{
              mt: 0.5,
              backgroundColor: alpha(typeColors[asset.type], 0.15),
              color: typeColors[asset.type],
            }}
          />
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Health Score */}
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Health Score
          </Typography>
          <Typography variant="h5" fontWeight={700} color={healthColors[healthStatus]}>
            {healthScore}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={healthScore}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha(healthColors[healthStatus], 0.2),
            '& .MuiLinearProgress-bar': {
              backgroundColor: healthColors[healthStatus],
              borderRadius: 4,
            },
          }}
        />
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label="Details" />
        <Tab label={`Work Orders (${assetWOs.length})`} />
        <Tab label={`PM Schedule (${assetPMs.length})`} />
        <Tab label={`Failure History (${asset.failureHistory?.length || 0})`} />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {tab === 0 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Site
              </Typography>
              <Typography variant="body2">{site?.name}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body2">
                {asset.floor} {asset.zone && `- ${asset.zone}`}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Manufacturer
              </Typography>
              <Typography variant="body2">{asset.manufacturer || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Model
              </Typography>
              <Typography variant="body2">{asset.model || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Serial Number
              </Typography>
              <Typography variant="body2">{asset.serialNumber || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Install Date
              </Typography>
              <Typography variant="body2">
                {asset.installDate ? format(new Date(asset.installDate), 'MMM d, yyyy') : '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Warranty Expiry
              </Typography>
              <Typography variant="body2">
                {asset.warrantyExpiry ? format(new Date(asset.warrantyExpiry), 'MMM d, yyyy') : '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Last Service
              </Typography>
              <Typography variant="body2">
                {asset.lastServiceDate ? format(new Date(asset.lastServiceDate), 'MMM d, yyyy') : '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body2">{asset.description || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: alpha(theme.palette.divider, 0.3),
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <QRIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Scan to view asset details
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {asset.id.toUpperCase()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <List dense>
            {assetWOs.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No work orders found
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              assetWOs.map((wo) => (
                <ListItem
                  key={wo.id}
                  sx={{
                    mb: 1,
                    backgroundColor: alpha(theme.palette.divider, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {wo.number}
                        </Typography>
                        <Chip
                          size="small"
                          label={wo.status.replace('_', ' ')}
                          sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {wo.faultType} - {format(new Date(wo.createdAt), 'MMM d, yyyy')}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        )}

        {tab === 2 && (
          <List dense>
            {assetPMs.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No PM schedules found
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              assetPMs.map((pm) => (
                <ListItem
                  key={pm.id}
                  sx={{
                    mb: 1,
                    backgroundColor: alpha(theme.palette.divider, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {pm.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Frequency: {pm.frequency}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Next due: {format(new Date(pm.nextDueDate), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    size="small"
                    label={pm.status}
                    sx={{
                      textTransform: 'capitalize',
                      backgroundColor:
                        pm.status === 'overdue'
                          ? alpha('#EF5350', 0.15)
                          : pm.status === 'upcoming'
                          ? alpha('#FFA726', 0.15)
                          : alpha('#66BB6A', 0.15),
                      color:
                        pm.status === 'overdue'
                          ? '#EF5350'
                          : pm.status === 'upcoming'
                          ? '#FFA726'
                          : '#66BB6A',
                    }}
                  />
                </ListItem>
              ))
            )}
          </List>
        )}

        {tab === 3 && (
          <Box>
            <Box sx={{ mb: 1.5 }}>
              {(() => {
                const mtbfMeta = getMTBFMeta(asset.mtbfDays);
                return (
                  <Chip
                    label={mtbfMeta.label}
                    sx={{
                      backgroundColor: mtbfMeta.bg,
                      color: mtbfMeta.color,
                      fontWeight: 700,
                    }}
                  />
                );
              })()}
            </Box>

            {(asset.failureHistory?.length || 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No failure events recorded.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>WO #</TableCell>
                      <TableCell>Failure Mode</TableCell>
                      <TableCell>Root Cause</TableCell>
                      <TableCell align="right">Downtime (h)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...(asset.failureHistory || [])]
                      .sort((eventA, eventB) => new Date(eventB.date).getTime() - new Date(eventA.date).getTime())
                      .map((event) => (
                        <TableRow key={`${event.woId}-${event.date}`}>
                          <TableCell>{format(new Date(event.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{event.woId.toUpperCase()}</TableCell>
                          <TableCell>{event.failureMode}</TableCell>
                          <TableCell>{rootCauseLabels[event.rootCause]}</TableCell>
                          <TableCell align="right">{event.downtimeHours.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
