import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  FormControl,
  GlobalStyles,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { floorPlanBuildings, floorPlansByBuilding } from '../data/floorplans';
import {
  AssetFeatureProperties,
  FloorPlanFeature,
  FloorPlanFloor,
  RoomFeatureProperties,
  ZoneFeatureProperties,
} from '../data/floorplans/types';
import { sites } from '../data/mockData';
import { useStore } from '../store/useStore';

type ViewMode = 'floor' | 'assets' | 'heatmap';
type RoomFloorFeature = {
  type: 'Feature';
  geometry: { type: 'Polygon'; coordinates: [number, number][][] };
  properties: RoomFeatureProperties;
};

type ZoneFloorFeature = {
  type: 'Feature';
  geometry: { type: 'Polygon'; coordinates: [number, number][][] };
  properties: ZoneFeatureProperties;
};

type AssetFloorFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: AssetFeatureProperties;
};

const roomTypeColorMap: Record<string, string> = {
  retail: '#14B8A633',
  office: '#8B5CF633',
  plant_room: '#FB923C4D',
  toilet: '#3B82F633',
  corridor: '#9CA3AF33',
  carpark: '#64748B33',
  food_court: '#22C55E3D',
};

const roomLegend = [
  { key: 'retail', label: 'Retail', color: '#14B8A6' },
  { key: 'plant_room', label: 'Plant Room', color: '#FB923C' },
  { key: 'corridor', label: 'Corridor', color: '#9CA3AF' },
  { key: 'toilet', label: 'Toilet', color: '#3B82F6' },
  { key: 'office', label: 'Office', color: '#8B5CF6' },
  { key: 'carpark', label: 'Carpark', color: '#64748B' },
  { key: 'food_court', label: 'Food Court', color: '#22C55E' },
];

const assetStatusLegend = [
  { key: 'good', label: 'Healthy', color: '#22C55E' },
  { key: 'warning', label: 'At Risk', color: '#F59E0B' },
  { key: 'critical', label: 'Critical', color: '#EF4444' },
];

const floorPlanStyle = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'floorplan-background',
      type: 'background',
      paint: {
        'background-color': '#0F172A',
      },
    },
  ],
};

const isRoomFeature = (feature: FloorPlanFeature): feature is RoomFloorFeature =>
  feature.geometry.type === 'Polygon' && feature.properties.featureType === 'room';

const isZoneFeature = (feature: FloorPlanFeature): feature is ZoneFloorFeature =>
  feature.geometry.type === 'Polygon' && feature.properties.featureType === 'zone';

const isAssetFeature = (feature: FloorPlanFeature): feature is AssetFloorFeature =>
  feature.geometry.type === 'Point' && feature.properties.featureType === 'asset';

const getPolygonCenter = (coordinates: [number, number][][]): [number, number] => {
  const ring = coordinates[0] || [];
  const validPoints = ring.slice(0, ring.length - 1);

  if (validPoints.length === 0) {
    return ring[0] || [0, 0];
  }

  const [lngSum, latSum] = validPoints.reduce(
    (accumulator, [lng, lat]) => [accumulator[0] + lng, accumulator[1] + lat],
    [0, 0]
  );

  return [lngSum / validPoints.length, latSum / validPoints.length];
};

const getAssetFloorCandidate = (
  assetId: string,
  preferredBuildingId?: string | null
): { buildingId: string; floor: FloorPlanFloor; feature: AssetFloorFeature } | null => {
  const buildingIds = preferredBuildingId
    ? [preferredBuildingId, ...Object.keys(floorPlansByBuilding).filter((id) => id !== preferredBuildingId)]
    : Object.keys(floorPlansByBuilding);

  for (const buildingId of buildingIds) {
    const floors = floorPlansByBuilding[buildingId as keyof typeof floorPlansByBuilding] || [];
    for (const floor of floors) {
      const assetFeature = floor.geojson.features.find(
        (feature): feature is AssetFloorFeature =>
          isAssetFeature(feature) && feature.properties.assetId === assetId
      );

      if (assetFeature) {
        return { buildingId, floor, feature: assetFeature };
      }
    }
  }

  return null;
};

export default function FloorPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSiteId, workOrders } = useStore();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const criticalMarkersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const defaultBuildingId =
    (selectedSiteId && floorPlansByBuilding[selectedSiteId as keyof typeof floorPlansByBuilding]
      ? selectedSiteId
      : null) || floorPlanBuildings[0]?.id || 'site-1';

  const [selectedBuildingId, setSelectedBuildingId] = useState(defaultBuildingId);
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('floor');
  const [panelOpen, setPanelOpen] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [pendingAssetFocusId, setPendingAssetFocusId] = useState<string | null>(null);

  const floors = useMemo(
    () => floorPlansByBuilding[selectedBuildingId as keyof typeof floorPlansByBuilding] || [],
    [selectedBuildingId]
  );

  const currentFloor =
    floors.find((floor) => floor.id === selectedFloorId) || floors[0] || null;

  useEffect(() => {
    if (floors.length === 0) {
      setSelectedFloorId('');
      return;
    }

    if (!selectedFloorId || !floors.some((floor) => floor.id === selectedFloorId)) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId]);

  useEffect(() => {
    if (
      selectedSiteId &&
      floorPlansByBuilding[selectedSiteId as keyof typeof floorPlansByBuilding] &&
      !location.search.includes('building=')
    ) {
      setSelectedBuildingId(selectedSiteId);
    }
  }, [selectedSiteId, location.search]);

  const roomFeatures = useMemo(
    () => (currentFloor?.geojson.features || []).filter(isRoomFeature),
    [currentFloor]
  );

  const assetFeatures = useMemo(
    () => (currentFloor?.geojson.features || []).filter(isAssetFeature),
    [currentFloor]
  );

  const roomRows = useMemo(() => {
    const assetCountByRoom = assetFeatures.reduce<Record<string, number>>((accumulator, feature) => {
      const roomId = feature.properties.roomId;
      accumulator[roomId] = (accumulator[roomId] || 0) + 1;
      return accumulator;
    }, {});

    return roomFeatures.map((feature) => ({
      id: feature.properties.id,
      name: feature.properties.name,
      type: feature.properties.type,
      area: feature.properties.area_sqm,
      assetCount: assetCountByRoom[feature.properties.id] || 0,
    }));
  }, [assetFeatures, roomFeatures]);

  const heatmapGeojson = useMemo(() => {
    if (!currentFloor) {
      return { type: 'FeatureCollection', features: [] };
    }

    const activeStatuses = new Set(['open', 'assigned', 'in_progress', 'pending_parts']);
    const assetToZone = new Map<string, string>();

    currentFloor.geojson.features.forEach((feature) => {
      if (isAssetFeature(feature)) {
        assetToZone.set(feature.properties.assetId, feature.properties.zoneId);
      }
    });

    const zoneWorkOrderCount = workOrders.reduce<Record<string, number>>((accumulator, workOrder) => {
      if (!activeStatuses.has(workOrder.status)) {
        return accumulator;
      }

      const zoneId = assetToZone.get(workOrder.assetId);
      if (!zoneId) {
        return accumulator;
      }

      accumulator[zoneId] = (accumulator[zoneId] || 0) + 1;
      return accumulator;
    }, {});

    const features = currentFloor.geojson.features
      .filter(isZoneFeature)
      .map((zoneFeature) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: getPolygonCenter(zoneFeature.geometry.coordinates),
        },
        properties: {
          zoneId: zoneFeature.properties.id,
          zoneName: zoneFeature.properties.name,
          density: zoneWorkOrderCount[zoneFeature.properties.id] || 0,
        },
      }))
      .filter((feature) => feature.properties.density > 0);

    return {
      type: 'FeatureCollection' as const,
      features,
    };
  }, [currentFloor, workOrders]);

  const clearCriticalMarkers = useCallback(() => {
    criticalMarkersRef.current.forEach((marker) => marker.remove());
    criticalMarkersRef.current = [];
  }, []);

  const openAssetPopup = useCallback(
    (coordinates: [number, number], assetProperties: AssetFloorFeature['properties']) => {
      if (!mapRef.current) {
        return;
      }

      popupRef.current?.remove();

      const popupContent = document.createElement('div');
      popupContent.style.display = 'flex';
      popupContent.style.flexDirection = 'column';
      popupContent.style.gap = '8px';
      popupContent.style.minWidth = '190px';

      const title = document.createElement('strong');
      title.textContent = assetProperties.name;
      title.style.fontSize = '13px';

      const status = document.createElement('div');
      status.textContent = `Status: ${assetProperties.status.replace('_', ' ')}`;
      status.style.fontSize = '12px';
      status.style.color = '#374151';

      const button = document.createElement('button');
      button.textContent = 'View Asset →';
      button.style.backgroundColor = '#0EA5E9';
      button.style.color = '#FFFFFF';
      button.style.border = 'none';
      button.style.borderRadius = '6px';
      button.style.padding = '6px 10px';
      button.style.cursor = 'pointer';
      button.style.fontSize = '12px';
      button.onclick = () => {
        navigate(`/assets?asset=${assetProperties.assetId}`);
      };

      popupContent.appendChild(title);
      popupContent.appendChild(status);
      popupContent.appendChild(button);

      popupRef.current = new maplibregl.Popup({ offset: 18 })
        .setLngLat(coordinates)
        .setDOMContent(popupContent)
        .addTo(mapRef.current);
    },
    [navigate]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const site = sites.find((item) => item.id === selectedBuildingId) || sites[0];

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: floorPlanStyle as maplibregl.StyleSpecification,
      center: [site.location.lng, site.location.lat],
      zoom: 18.4,
      pitch: 0,
      attributionControl: false,
    });

    mapRef.current = mapInstance;
    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapInstance.on('load', () => {
      const initialFloor = currentFloor?.geojson || { type: 'FeatureCollection', features: [] };
      const initialHeatmap = heatmapGeojson;

      mapInstance.addSource('floorplan-data', {
        type: 'geojson',
        data: initialFloor as any,
      });

      mapInstance.addSource('zone-heatmap-data', {
        type: 'geojson',
        data: initialHeatmap as any,
      });

      mapInstance.addLayer({
        id: 'rooms-fill',
        type: 'fill',
        source: 'floorplan-data',
        filter: ['==', ['get', 'featureType'], 'room'],
        paint: {
          'fill-color': [
            'match',
            ['get', 'type'],
            'retail',
            roomTypeColorMap.retail,
            'plant_room',
            roomTypeColorMap.plant_room,
            'corridor',
            roomTypeColorMap.corridor,
            'toilet',
            roomTypeColorMap.toilet,
            'office',
            roomTypeColorMap.office,
            'carpark',
            roomTypeColorMap.carpark,
            'food_court',
            roomTypeColorMap.food_court,
            '#1E293B66',
          ],
          'fill-opacity': 1,
        },
      });

      mapInstance.addLayer({
        id: 'rooms-outline',
        type: 'line',
        source: 'floorplan-data',
        filter: ['==', ['get', 'featureType'], 'room'],
        paint: {
          'line-color': '#334155',
          'line-width': 1,
        },
      });

      mapInstance.addLayer({
        id: 'room-labels',
        type: 'symbol',
        source: 'floorplan-data',
        minzoom: 18,
        filter: ['==', ['get', 'featureType'], 'room'],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-font': ['Open Sans Bold'],
        },
        paint: {
          'text-color': '#E2E8F0',
          'text-halo-color': '#0F172A',
          'text-halo-width': 1,
        },
      });

      mapInstance.addLayer({
        id: 'zones-outline',
        type: 'line',
        source: 'floorplan-data',
        filter: ['==', ['get', 'featureType'], 'zone'],
        paint: {
          'line-color': '#22D3EE',
          'line-width': 1.8,
          'line-opacity': 0.9,
          'line-dasharray': [2, 1.5],
        },
      });

      mapInstance.addLayer({
        id: 'assets-circles',
        type: 'circle',
        source: 'floorplan-data',
        filter: ['==', ['get', 'featureType'], 'asset'],
        paint: {
          'circle-color': [
            'match',
            ['get', 'status'],
            'critical',
            '#EF4444',
            'warning',
            '#F59E0B',
            '#22C55E',
          ],
          'circle-radius': 6,
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 1.5,
        },
      });

      mapInstance.addLayer({
        id: 'zone-heatmap-layer',
        type: 'heatmap',
        source: 'zone-heatmap-data',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'density'], 0, 0, 6, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 16, 0.5, 20, 1.5],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 16, 18, 20, 30],
          'heatmap-opacity': 0.85,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(14,165,233,0)',
            0.2,
            'rgba(56,189,248,0.45)',
            0.5,
            'rgba(251,191,36,0.75)',
            0.8,
            'rgba(249,115,22,0.88)',
            1,
            'rgba(239,68,68,0.95)',
          ],
        },
        layout: {
          visibility: 'none',
        },
      });

      mapInstance.on('mouseenter', 'assets-circles', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', 'assets-circles', () => {
        mapInstance.getCanvas().style.cursor = '';
      });

      mapInstance.on('click', 'assets-circles', (event) => {
        const clickedFeature = event.features?.[0] as any;
        if (!clickedFeature || clickedFeature.geometry?.type !== 'Point') {
          return;
        }

        const status: AssetFeatureProperties['status'] = ['good', 'warning', 'critical'].includes(
          clickedFeature.properties?.status
        )
          ? (clickedFeature.properties.status as AssetFeatureProperties['status'])
          : 'good';

        openAssetPopup(clickedFeature.geometry.coordinates, {
          featureType: 'asset',
          assetId: String(clickedFeature.properties?.assetId || ''),
          name: String(clickedFeature.properties?.name || 'Asset'),
          type: String(clickedFeature.properties?.type || 'General'),
          status,
          roomId: String(clickedFeature.properties?.roomId || ''),
          zoneId: String(clickedFeature.properties?.zoneId || ''),
        });
      });

      setMapReady(true);
    });

    return () => {
      clearCriticalMarkers();
      popupRef.current?.remove();
      mapInstance.remove();
      mapRef.current = null;
    };
  }, [clearCriticalMarkers, currentFloor, heatmapGeojson, openAssetPopup, selectedBuildingId]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !currentFloor) {
      return;
    }

    const floorSource = mapRef.current.getSource('floorplan-data') as maplibregl.GeoJSONSource;
    floorSource?.setData(currentFloor.geojson as any);

    if (roomFeatures.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      roomFeatures.forEach((feature) => {
        feature.geometry.coordinates[0].forEach((coordinate: [number, number]) =>
          bounds.extend(coordinate)
        );
      });
      mapRef.current.fitBounds(bounds, {
        padding: { top: 80, right: 100, bottom: 80, left: panelOpen ? 370 : 80 },
        duration: 650,
      });
    }
  }, [currentFloor, mapReady, panelOpen, roomFeatures]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const heatmapSource = mapRef.current.getSource('zone-heatmap-data') as maplibregl.GeoJSONSource;
    heatmapSource?.setData(heatmapGeojson as any);
  }, [heatmapGeojson, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    mapRef.current.setLayoutProperty(
      'assets-circles',
      'visibility',
      viewMode === 'assets' ? 'visible' : 'none'
    );
    mapRef.current.setLayoutProperty(
      'zone-heatmap-layer',
      'visibility',
      viewMode === 'heatmap' ? 'visible' : 'none'
    );
    mapRef.current.setPaintProperty('rooms-fill', 'fill-opacity', viewMode === 'heatmap' ? 0.25 : 1);
  }, [mapReady, viewMode]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !currentFloor) {
      clearCriticalMarkers();
      return;
    }

    clearCriticalMarkers();

    if (viewMode !== 'assets') {
      return;
    }

    assetFeatures
      .filter((feature) => feature.properties.status === 'critical')
      .forEach((feature) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'floorplan-critical-marker';
        markerElement.innerHTML = '<span class="floorplan-critical-dot"></span>';

        const marker = new maplibregl.Marker({ element: markerElement, anchor: 'center' })
          .setLngLat(feature.geometry.coordinates)
          .addTo(mapRef.current!);

        criticalMarkersRef.current.push(marker);
      });
  }, [assetFeatures, clearCriticalMarkers, currentFloor, mapReady, viewMode]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const buildingParam = searchParams.get('building');
    const floorParam = searchParams.get('floor');
    const assetParam = searchParams.get('asset');

    const hasBuilding =
      buildingParam && floorPlansByBuilding[buildingParam as keyof typeof floorPlansByBuilding];
    const resolvedBuildingId = hasBuilding ? buildingParam : selectedBuildingId;

    if (hasBuilding && buildingParam !== selectedBuildingId) {
      setSelectedBuildingId(buildingParam as string);
    }

    if (assetParam) {
      const assetTarget = getAssetFloorCandidate(assetParam, resolvedBuildingId);
      if (assetTarget) {
        setSelectedBuildingId(assetTarget.buildingId);
        setSelectedFloorId(assetTarget.floor.id);
        setPendingAssetFocusId(assetParam);
        return;
      }
    }

    const candidateFloors =
      floorPlansByBuilding[resolvedBuildingId as keyof typeof floorPlansByBuilding] || [];
    const normalizedFloorId =
      floorParam && candidateFloors.some((floor) => floor.id.toLowerCase() === floorParam.toLowerCase())
        ? candidateFloors.find((floor) => floor.id.toLowerCase() === floorParam.toLowerCase())?.id
        : null;

    if (normalizedFloorId) {
      setSelectedFloorId(normalizedFloorId);
    }

    if (assetParam) {
      setPendingAssetFocusId(assetParam);
    }
  }, [location.search, selectedBuildingId]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !currentFloor || !pendingAssetFocusId) {
      return;
    }

    const assetFeature = currentFloor.geojson.features.find(
      (feature): feature is AssetFloorFeature =>
        isAssetFeature(feature) && feature.properties.assetId === pendingAssetFocusId
    );

    if (!assetFeature) {
      return;
    }

    mapRef.current.flyTo({
      center: assetFeature.geometry.coordinates,
      zoom: 19.4,
      duration: 900,
    });

    openAssetPopup(assetFeature.geometry.coordinates, assetFeature.properties);
    setPendingAssetFocusId(null);
  }, [currentFloor, mapReady, openAssetPopup, pendingAssetFocusId]);

  const handleRoomClick = (roomId: string) => {
    if (!mapRef.current || !currentFloor) {
      return;
    }

    const room = currentFloor.geojson.features.find(
      (feature): feature is RoomFloorFeature =>
        isRoomFeature(feature) && feature.properties.id === roomId
    );

    if (!room) {
      return;
    }

    mapRef.current.flyTo({
      center: getPolygonCenter(room.geometry.coordinates),
      zoom: 19.1,
      duration: 700,
    });
  };

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes floorplanPulse': {
            '0%': { transform: 'translate(-50%, -50%) scale(0.95)', opacity: 1 },
            '70%': { transform: 'translate(-50%, -50%) scale(1.85)', opacity: 0 },
            '100%': { transform: 'translate(-50%, -50%) scale(0.95)', opacity: 0 },
          },
          '.floorplan-critical-marker': {
            position: 'relative',
            width: '20px',
            height: '20px',
          },
          '.floorplan-critical-marker::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid rgba(239, 68, 68, 0.85)',
            animation: 'floorplanPulse 1.5s ease-out infinite',
            pointerEvents: 'none',
          },
          '.floorplan-critical-dot': {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#EF4444',
            border: '1px solid #FFFFFF',
            boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
          },
        }}
      />

      <Box
        sx={{
          height: 'calc(100vh - 140px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, minWidth: 150 }}>
            Indoor Floor Plan
          </Typography>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Building</InputLabel>
            <Select
              value={selectedBuildingId}
              label="Building"
              onChange={(event) => setSelectedBuildingId(event.target.value)}
            >
              {floorPlanBuildings.map((building) => (
                <MenuItem key={building.id} value={building.id}>
                  {building.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tabs
            value={selectedFloorId}
            onChange={(_, nextValue) => setSelectedFloorId(nextValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38 } }}
          >
            {floors.map((floor) => (
              <Tab key={floor.id} value={floor.id} label={floor.id} />
            ))}
          </Tabs>

          <Box sx={{ flexGrow: 1 }} />

          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, nextValue) => {
              if (nextValue) {
                setViewMode(nextValue);
              }
            }}
          >
            <ToggleButton value="floor">Floor Plan</ToggleButton>
            <ToggleButton value="assets">Asset Overlay</ToggleButton>
            <ToggleButton value="heatmap">Heatmap</ToggleButton>
          </ToggleButtonGroup>
        </Card>

        <Card sx={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          <Box ref={mapContainerRef} sx={{ width: '100%', height: '100%' }} />

          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bottom: 12,
              width: panelOpen ? 350 : 46,
              overflow: 'hidden',
              transition: 'width 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: panelOpen ? 'space-between' : 'center',
                p: 1,
                borderBottom: panelOpen ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              {panelOpen && (
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Rooms on {selectedFloorId}
                </Typography>
              )}
              <IconButton size="small" onClick={() => setPanelOpen((current) => !current)}>
                {panelOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </Box>

            {panelOpen && (
              <TableContainer sx={{ flex: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Area (sqm)</TableCell>
                      <TableCell align="right">Assets</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roomRows.map((room) => (
                      <TableRow
                        hover
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{room.name}</TableCell>
                        <TableCell>{room.type.replace('_', ' ')}</TableCell>
                        <TableCell align="right">{room.area}</TableCell>
                        <TableCell align="right">{room.assetCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              width: 220,
              p: 1.25,
              zIndex: 2,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              color: '#E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LayersIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Legend
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>
              Room Types
            </Typography>
            {roomLegend.map((item) => (
              <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: item.color }} />
                <Typography variant="caption">{item.label}</Typography>
              </Box>
            ))}

            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.75, mb: 0.5 }}>
              Asset Status
            </Typography>
            {assetStatusLegend.map((item) => (
              <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                <Typography variant="caption">{item.label}</Typography>
              </Box>
            ))}

            <Box sx={{ mt: 0.6 }}>
              <Button
                size="small"
                fullWidth
                variant="outlined"
                sx={{ color: '#BAE6FD', borderColor: '#38BDF8' }}
                onClick={() => navigate('/assets')}
              >
                Open Asset Register
              </Button>
            </Box>
          </Paper>
        </Card>
      </Box>
    </>
  );
}
