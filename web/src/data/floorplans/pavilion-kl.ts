import { buildFloor } from './helpers';
import { FloorPlanFloor } from './types';

const basementZones = [
  { id: 'pkl-b-zone-north', name: 'North Carpark Zone', center: [0, 22] as [number, number], size: [96, 32] as [number, number] },
  { id: 'pkl-b-zone-central', name: 'Central Service Spine', center: [0, 0] as [number, number], size: [96, 16] as [number, number] },
  { id: 'pkl-b-zone-south', name: 'South MEP Zone', center: [0, -22] as [number, number], size: [96, 28] as [number, number] },
];

const b3Rooms = [
  { id: 'pkl-b3-carpark-west', name: 'B3 Carpark West', type: 'carpark' as const, center: [-25, 22] as [number, number], size: [42, 30] as [number, number], zoneId: 'pkl-b-zone-north' },
  { id: 'pkl-b3-carpark-east', name: 'B3 Carpark East', type: 'carpark' as const, center: [25, 22] as [number, number], size: [42, 30] as [number, number], zoneId: 'pkl-b-zone-north' },
  { id: 'pkl-b3-corridor', name: 'Main Service Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'pkl-b-zone-central' },
  { id: 'pkl-b3-plant-a', name: 'Chiller Plant Room', type: 'plant_room' as const, center: [-34, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b3-plant-b', name: 'Electrical Room', type: 'plant_room' as const, center: [-6, -22] as [number, number], size: [20, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b3-plant-c', name: 'Generator & Pump Room', type: 'plant_room' as const, center: [20, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b3-office', name: 'Control Office', type: 'office' as const, center: [42, -22] as [number, number], size: [12, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b3-toilet', name: 'Staff Toilet', type: 'toilet' as const, center: [42, -4] as [number, number], size: [12, 8] as [number, number], zoneId: 'pkl-b-zone-central' },
];

const b2Rooms = [
  { id: 'pkl-b2-carpark-west', name: 'B2 Carpark West', type: 'carpark' as const, center: [-22, 20] as [number, number], size: [46, 30] as [number, number], zoneId: 'pkl-b-zone-north' },
  { id: 'pkl-b2-carpark-east', name: 'B2 Carpark East', type: 'carpark' as const, center: [26, 20] as [number, number], size: [42, 30] as [number, number], zoneId: 'pkl-b-zone-north' },
  { id: 'pkl-b2-corridor', name: 'B2 Main Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'pkl-b-zone-central' },
  { id: 'pkl-b2-plant-a', name: 'AHU Room A', type: 'plant_room' as const, center: [-26, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b2-plant-b', name: 'AHU Room B', type: 'plant_room' as const, center: [2, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b2-office', name: 'Shift Office', type: 'office' as const, center: [32, -22] as [number, number], size: [20, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b2-toilet', name: 'Carpark Toilet', type: 'toilet' as const, center: [44, -3] as [number, number], size: [10, 8] as [number, number], zoneId: 'pkl-b-zone-central' },
];

const b1Rooms = [
  { id: 'pkl-b1-office-west', name: 'Security Office', type: 'office' as const, center: [-28, 20] as [number, number], size: [32, 18] as [number, number], zoneId: 'pkl-b-zone-north' },
  { id: 'pkl-b1-office-east', name: 'Control Room', type: 'office' as const, center: [12, 20] as [number, number], size: [36, 18] as [number, number], zoneId: 'pkl-b-zone-north' },
  { id: 'pkl-b1-corridor', name: 'B1 Service Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'pkl-b-zone-central' },
  { id: 'pkl-b1-retail-a', name: 'Back-of-house Retail A', type: 'retail' as const, center: [-30, -20] as [number, number], size: [28, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b1-retail-b', name: 'Back-of-house Retail B', type: 'retail' as const, center: [2, -20] as [number, number], size: [24, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b1-plant', name: 'Utilities Room', type: 'plant_room' as const, center: [30, -20] as [number, number], size: [20, 18] as [number, number], zoneId: 'pkl-b-zone-south' },
  { id: 'pkl-b1-toilet', name: 'Public Toilet B1', type: 'toilet' as const, center: [42, -3] as [number, number], size: [10, 8] as [number, number], zoneId: 'pkl-b-zone-central' },
];

const podiumZones = [
  { id: 'pkl-l-zone-north', name: 'North Retail Spine', center: [0, 22] as [number, number], size: [96, 30] as [number, number] },
  { id: 'pkl-l-zone-atrium', name: 'Atrium Spine', center: [0, 0] as [number, number], size: [96, 16] as [number, number] },
  { id: 'pkl-l-zone-south', name: 'South Retail Spine', center: [0, -22] as [number, number], size: [96, 28] as [number, number] },
];

const l1Rooms = [
  { id: 'pkl-l1-retail-a', name: 'L1 Boutique 01', type: 'retail' as const, center: [-30, 22] as [number, number], size: [30, 18] as [number, number], zoneId: 'pkl-l-zone-north' },
  { id: 'pkl-l1-retail-b', name: 'L1 Boutique 02', type: 'retail' as const, center: [8, 22] as [number, number], size: [24, 18] as [number, number], zoneId: 'pkl-l-zone-north' },
  { id: 'pkl-l1-retail-c', name: 'L1 Lifestyle Store', type: 'retail' as const, center: [34, 22] as [number, number], size: [22, 18] as [number, number], zoneId: 'pkl-l-zone-north' },
  { id: 'pkl-l1-corridor', name: 'Main Atrium Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 12] as [number, number], zoneId: 'pkl-l-zone-atrium' },
  { id: 'pkl-l1-retail-d', name: 'L1 Fashion Wing', type: 'retail' as const, center: [-30, -20] as [number, number], size: [30, 18] as [number, number], zoneId: 'pkl-l-zone-south' },
  { id: 'pkl-l1-retail-e', name: 'L1 Anchor Retail', type: 'retail' as const, center: [8, -20] as [number, number], size: [24, 18] as [number, number], zoneId: 'pkl-l-zone-south' },
  { id: 'pkl-l1-office', name: 'Tenant Support Office', type: 'office' as const, center: [34, -20] as [number, number], size: [22, 18] as [number, number], zoneId: 'pkl-l-zone-south' },
  { id: 'pkl-l1-toilet', name: 'Public Toilet L1', type: 'toilet' as const, center: [42, -2] as [number, number], size: [10, 8] as [number, number], zoneId: 'pkl-l-zone-atrium' },
  { id: 'pkl-l1-plant', name: 'Smoke Exhaust Shaft Room', type: 'plant_room' as const, center: [-44, -2] as [number, number], size: [8, 10] as [number, number], zoneId: 'pkl-l-zone-atrium' },
];

const l2Rooms = [
  { id: 'pkl-l2-retail-a', name: 'L2 Retail Pods', type: 'retail' as const, center: [-30, 22] as [number, number], size: [30, 18] as [number, number], zoneId: 'pkl-l-zone-north' },
  { id: 'pkl-l2-food-court', name: 'Sky Dining Court', type: 'food_court' as const, center: [12, 22] as [number, number], size: [46, 18] as [number, number], zoneId: 'pkl-l-zone-north' },
  { id: 'pkl-l2-corridor', name: 'L2 Atrium Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 12] as [number, number], zoneId: 'pkl-l-zone-atrium' },
  { id: 'pkl-l2-retail-b', name: 'L2 Family Retail', type: 'retail' as const, center: [-30, -20] as [number, number], size: [30, 18] as [number, number], zoneId: 'pkl-l-zone-south' },
  { id: 'pkl-l2-office', name: 'Leasing Office', type: 'office' as const, center: [-2, -20] as [number, number], size: [22, 18] as [number, number], zoneId: 'pkl-l-zone-south' },
  { id: 'pkl-l2-plant', name: 'Vertical Transport Plant', type: 'plant_room' as const, center: [24, -20] as [number, number], size: [18, 18] as [number, number], zoneId: 'pkl-l-zone-south' },
  { id: 'pkl-l2-toilet', name: 'Public Toilet L2', type: 'toilet' as const, center: [42, -2] as [number, number], size: [10, 8] as [number, number], zoneId: 'pkl-l-zone-atrium' },
];

export const floors: FloorPlanFloor[] = [
  buildFloor({
    siteId: 'site-1',
    id: 'B3',
    name: 'Basement 3',
    level: -3,
    zones: basementZones,
    rooms: b3Rooms,
    assetPlacements: [
      { assetId: 'asset-3', roomId: 'pkl-b3-plant-a', zoneId: 'pkl-b-zone-south', offset: [-38, -21] },
      { assetId: 'asset-5', roomId: 'pkl-b3-plant-b', zoneId: 'pkl-b-zone-south', offset: [-10, -22] },
      { assetId: 'asset-6', roomId: 'pkl-b3-plant-c', zoneId: 'pkl-b-zone-south', offset: [16, -20] },
      { assetId: 'asset-7', roomId: 'pkl-b3-office', zoneId: 'pkl-b-zone-south', offset: [42, -23] },
      { assetId: 'asset-11', roomId: 'pkl-b3-plant-c', zoneId: 'pkl-b-zone-south', offset: [25, -24] },
      { assetId: 'asset-13', roomId: 'pkl-b3-plant-c', zoneId: 'pkl-b-zone-south', offset: [20, -27] },
      { assetId: 'asset-14', roomId: 'pkl-b3-plant-c', zoneId: 'pkl-b-zone-south', offset: [13, -24] },
    ],
  }),
  buildFloor({
    siteId: 'site-1',
    id: 'B2',
    name: 'Basement 2',
    level: -2,
    zones: basementZones,
    rooms: b2Rooms,
    assetPlacements: [
      { assetId: 'asset-1', roomId: 'pkl-b2-plant-a', zoneId: 'pkl-b-zone-south', offset: [-29, -22] },
      { assetId: 'asset-2', roomId: 'pkl-b2-plant-b', zoneId: 'pkl-b-zone-south', offset: [3, -22] },
    ],
  }),
  buildFloor({
    siteId: 'site-1',
    id: 'B1',
    name: 'Basement 1',
    level: -1,
    zones: basementZones,
    rooms: b1Rooms,
    assetPlacements: [
      { assetId: 'asset-12', roomId: 'pkl-b1-office-west', zoneId: 'pkl-b-zone-north', offset: [-34, 20] },
      { assetId: 'asset-15', roomId: 'pkl-b1-office-east', zoneId: 'pkl-b-zone-north', offset: [8, 20] },
      { assetId: 'asset-16', roomId: 'pkl-b1-office-west', zoneId: 'pkl-b-zone-north', offset: [-22, 20] },
    ],
  }),
  buildFloor({
    siteId: 'site-1',
    id: 'L1',
    name: 'Level 1',
    level: 1,
    zones: podiumZones,
    rooms: l1Rooms,
    assetPlacements: [
      { assetId: 'asset-4', roomId: 'pkl-l1-corridor', zoneId: 'pkl-l-zone-atrium', offset: [0, -1] },
      { assetId: 'asset-8', roomId: 'pkl-l1-corridor', zoneId: 'pkl-l-zone-atrium', offset: [-8, 1] },
      { assetId: 'asset-10', roomId: 'pkl-l1-corridor', zoneId: 'pkl-l-zone-atrium', offset: [12, 1] },
      { assetId: 'asset-55', roomId: 'pkl-l1-plant', zoneId: 'pkl-l-zone-atrium', offset: [-44, -2] },
    ],
  }),
  buildFloor({
    siteId: 'site-1',
    id: 'L2',
    name: 'Level 2',
    level: 2,
    zones: podiumZones,
    rooms: l2Rooms,
    assetPlacements: [
      { assetId: 'asset-9', roomId: 'pkl-l2-corridor', zoneId: 'pkl-l-zone-atrium', offset: [-6, 0] },
    ],
  }),
];

