import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Card, CardContent, useTheme, Chip, IconButton, Tooltip } from '@mui/material';
import { Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon } from '@mui/icons-material';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { assets, sites, getAssetById, getSiteById, Asset } from '../../data/mockData';
import { useStore } from '../../store/useStore';

export default function AssetMap() {
  const theme = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const { selectedSiteId } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filteredAssets = selectedSiteId
    ? assets.filter(a => a.siteId === selectedSiteId)
    : assets;

  useEffect(() => {
    if (!mapContainer.current) return;

    // Determine center based on selected site
    const center = selectedSiteId
      ? sites.find(s => s.id === selectedSiteId)?.location
      : { lat: 3.1178, lng: 101.6773 }; // Mid Valley as default center

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [center?.lng || 101.6773, center?.lat || 3.1178],
      zoom: selectedSiteId ? 16 : 11,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [selectedSiteId]);

  // Add markers for assets
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredAssets.forEach(asset => {
      const el = document.createElement('div');
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';

      // Color based on health status
      if (asset.healthStatus === 'critical') {
        el.style.backgroundColor = '#EF5350';
      } else if (asset.healthStatus === 'warning') {
        el.style.backgroundColor = '#FFA726';
      } else {
        el.style.backgroundColor = '#66BB6A';
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });
      el.addEventListener('click', () => {
        setSelectedAsset(asset);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([asset.location.lng, asset.location.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (filteredAssets.length > 0 && !selectedSiteId) {
      const bounds = new maplibregl.LngLatBounds();
      filteredAssets.forEach(asset => {
        bounds.extend([asset.location.lng, asset.location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [filteredAssets, selectedSiteId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <Card
      sx={{
        height: isFullscreen ? '100vh' : 400,
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1300 : 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Asset Locations
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {filteredAssets.length} assets across {selectedSiteId ? '1 site' : `${sites.length} sites`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#66BB6A' }} />
              <Typography variant="caption">Good</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFA726' }} />
              <Typography variant="caption">Warning</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#EF5350' }} />
              <Typography variant="caption">Critical</Typography>
            </Box>
          </Box>
          <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <IconButton onClick={toggleFullscreen} size="small">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
      <Box
        ref={mapContainer}
        sx={{
          flexGrow: 1,
          position: 'relative',
          '& .maplibregl-ctrl-attrib': {
            fontSize: '10px',
          },
        }}
      />

      {/* Selected Asset Panel */}
      {selectedAsset && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            p: 2,
            boxShadow: 3,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedAsset.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAsset.type} • {getSiteById(selectedAsset.siteId)?.name}
              </Typography>
            </Box>
            <Chip
              label={`${selectedAsset.healthScore}%`}
              size="small"
              color={getHealthColor(selectedAsset.healthStatus)}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Floor: {selectedAsset.floor || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Zone: {selectedAsset.zone || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Open WOs: {selectedAsset.openWorkOrdersCount}
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setSelectedAsset(null)}
          >
            &times;
          </IconButton>
        </Box>
      )}
    </Card>
  );
}
