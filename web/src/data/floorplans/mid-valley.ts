import { buildFloor } from './helpers';
import { FloorPlanFloor } from './types';

const basementZones = [
  { id: 'mv-b-zone-north', name: 'North Parking Belt', center: [0, 22] as [number, number], size: [96, 32] as [number, number] },
  { id: 'mv-b-zone-central', name: 'Central Service Spine', center: [0, 0] as [number, number], size: [96, 16] as [number, number] },
  { id: 'mv-b-zone-south', name: 'South MEP Belt', center: [0, -22] as [number, number], size: [96, 28] as [number, number] },
];

const b3Rooms = [
  { id: 'mv-b3-carpark-west', name: 'B3 Carpark West', type: 'carpark' as const, center: [-25, 22] as [number, number], size: [42, 30] as [number, number], zoneId: 'mv-b-zone-north' },
  { id: 'mv-b3-carpark-east', name: 'B3 Carpark East', type: 'carpark' as const, center: [25, 22] as [number, number], size: [42, 30] as [number, number], zoneId: 'mv-b-zone-north' },
  { id: 'mv-b3-corridor', name: 'B3 Service Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'mv-b-zone-central' },
  { id: 'mv-b3-plant-a', name: 'Chiller Hall', type: 'plant_room' as const, center: [-34, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b3-plant-b', name: 'Electrical & Substation', type: 'plant_room' as const, center: [-6, -22] as [number, number], size: [20, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b3-plant-c', name: 'Generator & Fire Pump Room', type: 'plant_room' as const, center: [20, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b3-office', name: 'STP Ops Office', type: 'office' as const, center: [42, -22] as [number, number], size: [12, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b3-toilet', name: 'Staff Toilet', type: 'toilet' as const, center: [42, -4] as [number, number], size: [12, 8] as [number, number], zoneId: 'mv-b-zone-central' },
];

const b2Rooms = [
  { id: 'mv-b2-carpark-west', name: 'B2 Carpark West', type: 'carpark' as const, center: [-22, 20] as [number, number], size: [46, 30] as [number, number], zoneId: 'mv-b-zone-north' },
  { id: 'mv-b2-carpark-east', name: 'B2 Carpark East', type: 'carpark' as const, center: [26, 20] as [number, number], size: [42, 30] as [number, number], zoneId: 'mv-b-zone-north' },
  { id: 'mv-b2-corridor', name: 'B2 Main Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'mv-b-zone-central' },
  { id: 'mv-b2-plant-a', name: 'AHU Room A', type: 'plant_room' as const, center: [-26, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b2-plant-b', name: 'AHU Room B', type: 'plant_room' as const, center: [2, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b2-office', name: 'EV Monitoring Room', type: 'office' as const, center: [32, -22] as [number, number], size: [20, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b2-toilet', name: 'B2 Public Toilet', type: 'toilet' as const, center: [44, -3] as [number, number], size: [10, 8] as [number, number], zoneId: 'mv-b-zone-central' },
];

const b1Rooms = [
  { id: 'mv-b1-office-west', name: 'Fire Command Centre', type: 'office' as const, center: [-28, 20] as [number, number], size: [32, 18] as [number, number], zoneId: 'mv-b-zone-north' },
  { id: 'mv-b1-office-east', name: 'BMS Room', type: 'office' as const, center: [12, 20] as [number, number], size: [36, 18] as [number, number], zoneId: 'mv-b-zone-north' },
  { id: 'mv-b1-corridor', name: 'B1 Service Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'mv-b-zone-central' },
  { id: 'mv-b1-retail-a', name: 'Back-office Retail A', type: 'retail' as const, center: [-30, -20] as [number, number], size: [28, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b1-retail-b', name: 'Back-office Retail B', type: 'retail' as const, center: [2, -20] as [number, number], size: [24, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b1-plant', name: 'Utility Plant Room', type: 'plant_room' as const, center: [30, -20] as [number, number], size: [20, 18] as [number, number], zoneId: 'mv-b-zone-south' },
  { id: 'mv-b1-toilet', name: 'Public Toilet B1', type: 'toilet' as const, center: [42, -3] as [number, number], size: [10, 8] as [number, number], zoneId: 'mv-b-zone-central' },
];

const retailZones = [
  { id: 'mv-l-zone-north', name: 'North Retail Lane', center: [0, 22] as [number, number], size: [96, 30] as [number, number] },
  { id: 'mv-l-zone-atrium', name: 'Centre Court Spine', center: [0, 0] as [number, number], size: [96, 16] as [number, number] },
  { id: 'mv-l-zone-south', name: 'South Retail Lane', center: [0, -22] as [number, number], size: [96, 28] as [number, number] },
];

const l1Rooms = [
  { id: 'mv-l1-retail-a', name: 'L1 Centre Court Retail 01', type: 'retail' as const, center: [-30, 22] as [number, number], size: [30, 18] as [number, number], zoneId: 'mv-l-zone-north' },
  { id: 'mv-l1-retail-b', name: 'L1 Centre Court Retail 02', type: 'retail' as const, center: [8, 22] as [number, number], size: [24, 18] as [number, number], zoneId: 'mv-l-zone-north' },
  { id: 'mv-l1-retail-c', name: 'L1 Flagship Retail', type: 'retail' as const, center: [34, 22] as [number, number], size: [22, 18] as [number, number], zoneId: 'mv-l-zone-north' },
  { id: 'mv-l1-corridor', name: 'Centre Court Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 12] as [number, number], zoneId: 'mv-l-zone-atrium' },
  { id: 'mv-l1-retail-d', name: 'L1 South Fashion', type: 'retail' as const, center: [-30, -20] as [number, number], size: [30, 18] as [number, number], zoneId: 'mv-l-zone-south' },
  { id: 'mv-l1-retail-e', name: 'L1 Entertainment Strip', type: 'retail' as const, center: [8, -20] as [number, number], size: [24, 18] as [number, number], zoneId: 'mv-l-zone-south' },
  { id: 'mv-l1-office', name: 'Mall Ops Office', type: 'office' as const, center: [34, -20] as [number, number], size: [22, 18] as [number, number], zoneId: 'mv-l-zone-south' },
  { id: 'mv-l1-toilet', name: 'Public Toilet L1', type: 'toilet' as const, center: [42, -2] as [number, number], size: [10, 8] as [number, number], zoneId: 'mv-l-zone-atrium' },
  { id: 'mv-l1-plant', name: 'LED Ops Room', type: 'plant_room' as const, center: [-44, -2] as [number, number], size: [8, 10] as [number, number], zoneId: 'mv-l-zone-atrium' },
];

const l2Rooms = [
  { id: 'mv-l2-retail-a', name: 'L2 Lifestyle Retail', type: 'retail' as const, center: [-30, 22] as [number, number], size: [30, 18] as [number, number], zoneId: 'mv-l-zone-north' },
  { id: 'mv-l2-food-court', name: 'L2 Food Terrace', type: 'food_court' as const, center: [12, 22] as [number, number], size: [46, 18] as [number, number], zoneId: 'mv-l-zone-north' },
  { id: 'mv-l2-corridor', name: 'L2 Atrium Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 12] as [number, number], zoneId: 'mv-l-zone-atrium' },
  { id: 'mv-l2-retail-b', name: 'L2 Family Retail', type: 'retail' as const, center: [-30, -20] as [number, number], size: [30, 18] as [number, number], zoneId: 'mv-l-zone-south' },
  { id: 'mv-l2-office', name: 'Leasing Ops Office', type: 'office' as const, center: [-2, -20] as [number, number], size: [22, 18] as [number, number], zoneId: 'mv-l-zone-south' },
  { id: 'mv-l2-plant', name: 'Vertical Transport Plant', type: 'plant_room' as const, center: [24, -20] as [number, number], size: [18, 18] as [number, number], zoneId: 'mv-l-zone-south' },
  { id: 'mv-l2-toilet', name: 'Public Toilet L2', type: 'toilet' as const, center: [42, -2] as [number, number], size: [10, 8] as [number, number], zoneId: 'mv-l-zone-atrium' },
];

export const floors: FloorPlanFloor[] = [
  buildFloor({
    siteId: 'site-3',
    id: 'B3',
    name: 'Basement 3',
    level: -3,
    zones: basementZones,
    rooms: b3Rooms,
    assetPlacements: [
      { assetId: 'asset-34', roomId: 'mv-b3-plant-a', zoneId: 'mv-b-zone-south', offset: [-36, -22] },
      { assetId: 'asset-35', roomId: 'mv-b3-plant-a', zoneId: 'mv-b-zone-south', offset: [-28, -22] },
      { assetId: 'asset-36', roomId: 'mv-b3-plant-b', zoneId: 'mv-b-zone-south', offset: [-8, -22] },
      { assetId: 'asset-37', roomId: 'mv-b3-plant-b', zoneId: 'mv-b-zone-south', offset: [-2, -22] },
      { assetId: 'asset-38', roomId: 'mv-b3-plant-c', zoneId: 'mv-b-zone-south', offset: [16, -22] },
      { assetId: 'asset-39', roomId: 'mv-b3-plant-b', zoneId: 'mv-b-zone-south', offset: [2, -25] },
      { assetId: 'asset-44', roomId: 'mv-b3-plant-c', zoneId: 'mv-b-zone-south', offset: [23, -22] },
      { assetId: 'asset-45', roomId: 'mv-b3-plant-c', zoneId: 'mv-b-zone-south', offset: [18, -26] },
      { assetId: 'asset-48', roomId: 'mv-b3-office', zoneId: 'mv-b-zone-south', offset: [42, -22] },
    ],
  }),
  buildFloor({
    siteId: 'site-3',
    id: 'B2',
    name: 'Basement 2',
    level: -2,
    zones: basementZones,
    rooms: b2Rooms,
    assetPlacements: [
      { assetId: 'asset-31', roomId: 'mv-b2-plant-a', zoneId: 'mv-b-zone-south', offset: [-28, -21] },
      { assetId: 'asset-32', roomId: 'mv-b2-plant-b', zoneId: 'mv-b-zone-south', offset: [0, -21] },
      { assetId: 'asset-33', roomId: 'mv-b2-plant-b', zoneId: 'mv-b-zone-south', offset: [8, -21] },
      { assetId: 'asset-53', roomId: 'mv-b2-office', zoneId: 'mv-b-zone-south', offset: [32, -21] },
    ],
  }),
  buildFloor({
    siteId: 'site-3',
    id: 'B1',
    name: 'Basement 1',
    level: -1,
    zones: basementZones,
    rooms: b1Rooms,
    assetPlacements: [
      { assetId: 'asset-46', roomId: 'mv-b1-office-west', zoneId: 'mv-b-zone-north', offset: [-30, 20] },
      { assetId: 'asset-49', roomId: 'mv-b1-office-east', zoneId: 'mv-b-zone-north', offset: [10, 20] },
    ],
  }),
  buildFloor({
    siteId: 'site-3',
    id: 'L1',
    name: 'Level 1',
    level: 1,
    zones: retailZones,
    rooms: l1Rooms,
    assetPlacements: [
      { assetId: 'asset-40', roomId: 'mv-l1-corridor', zoneId: 'mv-l-zone-atrium', offset: [-8, 0] },
      { assetId: 'asset-42', roomId: 'mv-l1-corridor', zoneId: 'mv-l-zone-atrium', offset: [4, 0] },
      { assetId: 'asset-43', roomId: 'mv-l1-corridor', zoneId: 'mv-l-zone-atrium', offset: [14, 0] },
      { assetId: 'asset-50', roomId: 'mv-l1-plant', zoneId: 'mv-l-zone-atrium', offset: [-44, -2] },
    ],
  }),
  buildFloor({
    siteId: 'site-3',
    id: 'L2',
    name: 'Level 2',
    level: 2,
    zones: retailZones,
    rooms: l2Rooms,
    assetPlacements: [
      { assetId: 'asset-41', roomId: 'mv-l2-corridor', zoneId: 'mv-l-zone-atrium', offset: [-6, 0] },
    ],
  }),
];

