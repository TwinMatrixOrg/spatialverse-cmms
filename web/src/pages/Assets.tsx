import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Drawer,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Map as MapIcon,
  Search as SearchIcon,
  ViewList as ListIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import {
  assets,
  Asset,
  AssetType,
  getSiteById,
  pmSchedules,
  sites,
  WorkOrder,
  workOrderStatusLabels,
} from '../data/mockData';
import { useStore } from '../store/useStore';

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

const getHealthColor = (score: number) => {
  if (score < 40) return '#EF5350';
  if (score <= 70) return '#FFA726';
  return '#66BB6A';
};

export default function Assets() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { selectedSiteId, workOrders } = useStore();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'table' | 'map'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | 'critical' | 'warning' | 'good'>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const openWOCountByAsset = useMemo(() => {
    return workOrders.reduce<Record<string, number>>((counts, workOrder) => {
      if (['resolved', 'closed'].includes(workOrder.status)) {
        return counts;
      }

      counts[workOrder.assetId] = (counts[workOrder.assetId] || 0) + 1;
      return counts;
    }, {});
  }, [workOrders]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (selectedSiteId && asset.siteId !== selectedSiteId) return false;
      if (typeFilter !== 'all' && asset.type !== typeFilter) return false;
      if (healthFilter !== 'all' && asset.healthStatus !== healthFilter) return false;
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
  }, [healthFilter, searchQuery, selectedSiteId, typeFilter]);

  useEffect(() => {
    if (!mapContainer.current || map.current || viewMode === 'table') return;

    const selectedSite = selectedSiteId ? sites.find((site) => site.id === selectedSiteId) : null;
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
  }, [selectedSiteId, viewMode]);

  useEffect(() => {
    if (!map.current || viewMode === 'table') return;

    const markers = document.querySelectorAll('.asset-marker');
    markers.forEach((marker) => marker.remove());

    filteredAssets.forEach((asset) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'asset-marker';
      markerEl.style.width = '28px';
      markerEl.style.height = '28px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.border = '3px solid white';
      markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      markerEl.style.cursor = 'pointer';
      markerEl.style.backgroundColor = healthColors[asset.healthStatus];
      markerEl.onclick = () => setSelectedAsset(asset);

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <strong style="font-size: 14px;">${asset.name}</strong>
          <div style="font-size: 12px; color: #666; margin-top: 2px;">${asset.type}</div>
          <div style="font-size: 12px; margin-top: 4px;">
            Health: <span style="color: ${healthColors[asset.healthStatus]}; font-weight: 600;">${asset.healthScore}%</span>
          </div>
        </div>
      `);

      new maplibregl.Marker({ element: markerEl })
        .setLngLat([asset.location.lng, asset.location.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    if (filteredAssets.length > 1 && map.current) {
      const bounds = new maplibregl.LngLatBounds();
      filteredAssets.forEach((asset) => {
        bounds.extend([asset.location.lng, asset.location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [filteredAssets, viewMode]);

  const handleOpenWorkOrder = (workOrderId: string) => {
    navigate(`/work-orders?wo=${workOrderId}`);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Assets
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Asset
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
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
            onChange={(event) => setTypeFilter(event.target.value as AssetType | 'all')}
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
            onChange={(event) => setHealthFilter(event.target.value as 'all' | 'critical' | 'warning' | 'good')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="good">Good</MenuItem>
          </Select>
        </FormControl>
        <Chip label={`${filteredAssets.length} assets`} sx={{ alignSelf: 'center' }} />
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

      <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
        {(viewMode === 'split' || viewMode === 'table') && (
          <TableContainer component={Paper} sx={{ flex: viewMode === 'split' ? '0 0 55%' : 1, overflow: 'auto' }}>
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
                  const openCount = openWOCountByAsset[asset.id] || 0;

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
                            value={asset.healthScore}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(healthColors[asset.healthStatus], 0.2),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: healthColors[asset.healthStatus],
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography variant="caption" fontWeight={600} color={healthColors[asset.healthStatus]}>
                            {asset.healthScore}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {openCount > 0 ? (
                          <Chip size="small" label={openCount} color="error" sx={{ height: 22, minWidth: 28 }} />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {asset.lastServiceDate ? format(new Date(asset.lastServiceDate), 'MMM d, yyyy') : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {(viewMode === 'split' || viewMode === 'map') && (
          <Card sx={{ flex: viewMode === 'split' ? '0 0 45%' : 1, overflow: 'hidden' }}>
            <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />
          </Card>
        )}
      </Box>

      <Drawer
        anchor="right"
        open={Boolean(selectedAsset)}
        onClose={() => setSelectedAsset(null)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 520 } },
        }}
      >
        {selectedAsset && (
          <AssetDetailPanel
            asset={selectedAsset}
            workOrders={workOrders}
            onClose={() => setSelectedAsset(null)}
            onOpenWorkOrder={handleOpenWorkOrder}
          />
        )}
      </Drawer>
    </Box>
  );
}

function AssetDetailPanel({
  asset,
  workOrders,
  onClose,
  onOpenWorkOrder,
}: {
  asset: Asset;
  workOrders: WorkOrder[];
  onClose: () => void;
  onOpenWorkOrder: (workOrderId: string) => void;
}) {
  const theme = useTheme();
  const site = getSiteById(asset.siteId);

  const linkedWorkOrders = useMemo(() => workOrders.filter((workOrder) => workOrder.assetId === asset.id), [asset.id, workOrders]);

  const openWorkOrders = useMemo(
    () => linkedWorkOrders.filter((workOrder) => !['resolved', 'closed'].includes(workOrder.status)),
    [linkedWorkOrders]
  );

  const maintenanceHistory = useMemo(
    () =>
      linkedWorkOrders
        .filter((workOrder) => ['resolved', 'closed'].includes(workOrder.status))
        .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())
        .slice(0, 5),
    [linkedWorkOrders]
  );

  const pmTasks = useMemo(
    () =>
      pmSchedules
        .filter((pmSchedule) => pmSchedule.assetId === asset.id)
        .sort((first, second) => new Date(first.nextDueDate).getTime() - new Date(second.nextDueDate).getTime())
        .slice(0, 3),
    [asset.id]
  );

  const healthColor = getHealthColor(asset.healthScore);

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
              mt: 0.75,
              backgroundColor: alpha(typeColors[asset.type], 0.15),
              color: typeColors[asset.type],
            }}
          />
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          Asset Information
        </Typography>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Site
            </Typography>
            <Typography variant="body2">{site?.name || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Floor
            </Typography>
            <Typography variant="body2">{asset.floor || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Location Description
            </Typography>
            <Typography variant="body2">{[asset.zone, asset.description].filter(Boolean).join(' • ') || '-'}</Typography>
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
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Manufacturer
            </Typography>
            <Typography variant="body2">{asset.manufacturer || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Model
            </Typography>
            <Typography variant="body2">{asset.model || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Serial Number
            </Typography>
            <Typography variant="body2">{asset.serialNumber || '-'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          Health Score
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Current health condition
          </Typography>
          <Typography variant="h4" fontWeight={700} color={healthColor}>
            {asset.healthScore}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={asset.healthScore}
          sx={{
            height: 12,
            borderRadius: 8,
            backgroundColor: alpha(healthColor, 0.2),
            '& .MuiLinearProgress-bar': {
              backgroundColor: healthColor,
              borderRadius: 8,
            },
          }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          Open Work Orders
        </Typography>
        {openWorkOrders.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No open work orders linked to this asset.
          </Typography>
        ) : (
          <List dense>
            {openWorkOrders.map((workOrder) => (
              <ListItem
                key={workOrder.id}
                onClick={() => onOpenWorkOrder(workOrder.id)}
                sx={{
                  mb: 1,
                  px: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.divider, 0.3),
                  cursor: 'pointer',
                }}
              >
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600}>{workOrder.number}</Typography>}
                  secondary={<Typography variant="caption">{workOrder.faultType}</Typography>}
                />
                <Chip
                  size="small"
                  label={workOrderStatusLabels[workOrder.status]}
                  sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          PM Schedule (Next 3)
        </Typography>
        {pmTasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No PM tasks scheduled.
          </Typography>
        ) : (
          <List dense>
            {pmTasks.map((task) => (
              <ListItem key={task.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600}>{task.name}</Typography>}
                  secondary={`Due ${format(new Date(task.nextDueDate), 'MMM d, yyyy')} • ${task.frequency}`}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          QR Code
        </Typography>
        <QRCodePlaceholder value={asset.id} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          Maintenance History (Last 5)
        </Typography>
        {maintenanceHistory.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No completed maintenance history yet.
          </Typography>
        ) : (
          <List dense>
            {maintenanceHistory.map((workOrder) => (
              <ListItem key={workOrder.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={600}>{workOrder.number}</Typography>}
                  secondary={`${workOrder.faultType} • ${format(new Date(workOrder.updatedAt), 'MMM d, yyyy')}`}
                />
                <Chip size="small" label={workOrderStatusLabels[workOrder.status]} color="success" />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}

function QRCodePlaceholder({ value }: { value: string }) {
  const blocks = value.split('').map((char) => char.charCodeAt(0));
  const size = 17;
  const cells: boolean[] = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const seed = blocks[(row + col) % blocks.length] || 0;
      cells.push(((row * 31 + col * 17 + seed) % 3) === 0);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        py: 2,
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width="150" height="150" role="img" aria-label={`QR for ${value}`}>
        <rect width={size} height={size} fill="#fff" />
        {cells.map((filled, index) => {
          if (!filled) return null;
          const x = index % size;
          const y = Math.floor(index / size);
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" />;
        })}
      </svg>
      <Typography variant="caption" color="text.secondary">
        Asset ID: {value}
      </Typography>
    </Box>
  );
}
