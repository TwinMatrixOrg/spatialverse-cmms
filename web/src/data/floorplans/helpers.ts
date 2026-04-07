import { assets, sites } from '../mockData';
import { FloorPlanFeature, FloorPlanFloor, RoomType } from './types';

interface ZoneSpec {
  id: string;
  name: string;
  center: [number, number];
  size: [number, number];
}

interface RoomSpec {
  id: string;
  name: string;
  type: RoomType;
  center: [number, number];
  size: [number, number];
  zoneId: string;
}

interface AssetPlacement {
  assetId: string;
  roomId: string;
  zoneId: string;
  offset: [number, number];
}

interface BuildFloorParams {
  siteId: string;
  id: string;
  name: string;
  level: number;
  zones: ZoneSpec[];
  rooms: RoomSpec[];
  assetPlacements: AssetPlacement[];
}

const metersPerDegreeLat = 110540;

const localToLngLat = (
  siteId: string,
  offsetX: number,
  offsetY: number
): [number, number] => {
  const site = sites.find((item) => item.id === siteId);
  if (!site) {
    throw new Error(`Unknown site id: ${siteId}`);
  }

  const metersPerDegreeLng = 111320 * Math.cos((site.location.lat * Math.PI) / 180);

  return [
    site.location.lng + offsetX / metersPerDegreeLng,
    site.location.lat + offsetY / metersPerDegreeLat,
  ];
};

const rectangleCoordinates = (
  siteId: string,
  center: [number, number],
  size: [number, number]
): [number, number][][] => {
  const [centerX, centerY] = center;
  const [width, height] = size;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const topLeft = localToLngLat(siteId, centerX - halfWidth, centerY + halfHeight);
  const topRight = localToLngLat(siteId, centerX + halfWidth, centerY + halfHeight);
  const bottomRight = localToLngLat(siteId, centerX + halfWidth, centerY - halfHeight);
  const bottomLeft = localToLngLat(siteId, centerX - halfWidth, centerY - halfHeight);

  return [[topLeft, topRight, bottomRight, bottomLeft, topLeft]];
};

export const buildFloor = ({
  siteId,
  id,
  name,
  level,
  zones,
  rooms,
  assetPlacements,
}: BuildFloorParams): FloorPlanFloor => {
  const roomFeatures: FloorPlanFeature[] = rooms.map((room) => ({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: rectangleCoordinates(siteId, room.center, room.size),
    },
    properties: {
      featureType: 'room',
      id: room.id,
      name: room.name,
      type: room.type,
      area_sqm: Math.round(room.size[0] * room.size[1]),
      zoneId: room.zoneId,
    },
  }));

  const zoneFeatures: FloorPlanFeature[] = zones.map((zone) => ({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: rectangleCoordinates(siteId, zone.center, zone.size),
    },
    properties: {
      featureType: 'zone',
      id: zone.id,
      name: zone.name,
      type: 'zone',
    },
  }));

  const assetFeatures: FloorPlanFeature[] = assetPlacements
    .reduce((accumulator, placement) => {
      const asset = assets.find((item) => item.id === placement.assetId);
      if (!asset) {
        return accumulator;
      }

      accumulator.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: localToLngLat(siteId, placement.offset[0], placement.offset[1]),
        },
        properties: {
          featureType: 'asset',
          assetId: asset.id,
          name: asset.name,
          type: asset.type,
          status: asset.healthStatus,
          roomId: placement.roomId,
          zoneId: placement.zoneId,
        },
      });

      return accumulator;
    }, [] as FloorPlanFeature[]);

  return {
    id,
    name,
    level,
    geojson: {
      type: 'FeatureCollection',
      features: [...roomFeatures, ...zoneFeatures, ...assetFeatures],
    },
  };
};
