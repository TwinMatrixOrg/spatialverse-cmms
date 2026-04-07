export type RoomType =
  | 'retail'
  | 'office'
  | 'plant_room'
  | 'toilet'
  | 'corridor'
  | 'carpark'
  | 'food_court';

export type AssetFloorStatus = 'good' | 'warning' | 'critical';

export interface RoomFeatureProperties {
  featureType: 'room';
  id: string;
  name: string;
  type: RoomType;
  area_sqm: number;
  zoneId: string;
}

export interface ZoneFeatureProperties {
  featureType: 'zone';
  id: string;
  name: string;
  type: 'zone';
}

export interface AssetFeatureProperties {
  featureType: 'asset';
  assetId: string;
  name: string;
  type: string;
  status: AssetFloorStatus;
  roomId: string;
  zoneId: string;
}

export type FloorPlanFeatureProperties =
  | RoomFeatureProperties
  | ZoneFeatureProperties
  | AssetFeatureProperties;

export interface FloorPlanPolygonFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
  properties: RoomFeatureProperties | ZoneFeatureProperties;
}

export interface FloorPlanPointFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: AssetFeatureProperties;
}

export type FloorPlanFeature = FloorPlanPolygonFeature | FloorPlanPointFeature;

export interface FloorPlanFeatureCollection {
  type: 'FeatureCollection';
  features: FloorPlanFeature[];
}

export interface FloorPlanFloor {
  id: string;
  name: string;
  level: number;
  geojson: FloorPlanFeatureCollection;
}

