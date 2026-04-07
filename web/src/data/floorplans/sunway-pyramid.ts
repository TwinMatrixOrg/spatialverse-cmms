import { buildFloor } from './helpers';
import { FloorPlanFloor } from './types';

const basementZones = [
  { id: 'sp-b-zone-north', name: 'North Parking Belt', center: [0, 22] as [number, number], size: [96, 32] as [number, number] },
  { id: 'sp-b-zone-central', name: 'Central Service Spine', center: [0, 0] as [number, number], size: [96, 16] as [number, number] },
  { id: 'sp-b-zone-south', name: 'South MEP Belt', center: [0, -22] as [number, number], size: [96, 28] as [number, number] },
];

const b3Rooms = [
  { id: 'sp-b3-carpark-west', name: 'B3 Carpark West', type: 'carpark' as const, center: [-25, 22] as [number, number], size: [42, 30] as [number, number], zoneId: 'sp-b-zone-north' },
  { id: 'sp-b3-carpark-east', name: 'B3 Carpark East', type: 'carpark' as const, center: [25, 22] as [number, number], size: [42, 30] as [number, number], zoneId: 'sp-b-zone-north' },
  { id: 'sp-b3-corridor', name: 'B3 Service Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'sp-b-zone-central' },
  { id: 'sp-b3-plant-a', name: 'Chiller Hall', type: 'plant_room' as const, center: [-34, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b3-plant-b', name: 'Main Electrical Room', type: 'plant_room' as const, center: [-6, -22] as [number, number], size: [20, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b3-plant-c', name: 'Generator Compound', type: 'plant_room' as const, center: [20, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b3-office', name: 'Duty Engineer Office', type: 'office' as const, center: [42, -22] as [number, number], size: [12, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b3-toilet', name: 'Staff Toilet', type: 'toilet' as const, center: [42, -4] as [number, number], size: [12, 8] as [number, number], zoneId: 'sp-b-zone-central' },
];

const b2Rooms = [
  { id: 'sp-b2-carpark-west', name: 'B2 Carpark West', type: 'carpark' as const, center: [-22, 20] as [number, number], size: [46, 30] as [number, number], zoneId: 'sp-b-zone-north' },
  { id: 'sp-b2-carpark-east', name: 'B2 Carpark East', type: 'carpark' as const, center: [26, 20] as [number, number], size: [42, 30] as [number, number], zoneId: 'sp-b-zone-north' },
  { id: 'sp-b2-corridor', name: 'B2 Main Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'sp-b-zone-central' },
  { id: 'sp-b2-plant-a', name: 'AHU Room A', type: 'plant_room' as const, center: [-26, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b2-plant-b', name: 'AHU Room B', type: 'plant_room' as const, center: [2, -22] as [number, number], size: [24, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b2-office', name: 'Service Office', type: 'office' as const, center: [32, -22] as [number, number], size: [20, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b2-toilet', name: 'B2 Public Toilet', type: 'toilet' as const, center: [44, -3] as [number, number], size: [10, 8] as [number, number], zoneId: 'sp-b-zone-central' },
];

const b1Rooms = [
  { id: 'sp-b1-office-west', name: 'Server Room', type: 'office' as const, center: [-28, 20] as [number, number], size: [32, 18] as [number, number], zoneId: 'sp-b-zone-north' },
  { id: 'sp-b1-office-east', name: 'Operations Office', type: 'office' as const, center: [12, 20] as [number, number], size: [36, 18] as [number, number], zoneId: 'sp-b-zone-north' },
  { id: 'sp-b1-corridor', name: 'B1 Service Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 10] as [number, number], zoneId: 'sp-b-zone-central' },
  { id: 'sp-b1-retail-a', name: 'Back-office Retail A', type: 'retail' as const, center: [-30, -20] as [number, number], size: [28, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b1-retail-b', name: 'Back-office Retail B', type: 'retail' as const, center: [2, -20] as [number, number], size: [24, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b1-plant', name: 'Pump Utility Room', type: 'plant_room' as const, center: [30, -20] as [number, number], size: [20, 18] as [number, number], zoneId: 'sp-b-zone-south' },
  { id: 'sp-b1-toilet', name: 'Public Toilet B1', type: 'toilet' as const, center: [42, -3] as [number, number], size: [10, 8] as [number, number], zoneId: 'sp-b-zone-central' },
];

const retailZones = [
  { id: 'sp-l-zone-north', name: 'North Retail Lane', center: [0, 22] as [number, number], size: [96, 30] as [number, number] },
  { id: 'sp-l-zone-atrium', name: 'Blue Atrium Spine', center: [0, 0] as [number, number], size: [96, 16] as [number, number] },
  { id: 'sp-l-zone-south', name: 'South Retail Lane', center: [0, -22] as [number, number], size: [96, 28] as [number, number] },
];

const l1Rooms = [
  { id: 'sp-l1-retail-a', name: 'L1 Pyramid Fashion 01', type: 'retail' as const, center: [-30, 22] as [number, number], size: [30, 18] as [number, number], zoneId: 'sp-l-zone-north' },
  { id: 'sp-l1-retail-b', name: 'L1 Pyramid Fashion 02', type: 'retail' as const, center: [8, 22] as [number, number], size: [24, 18] as [number, number], zoneId: 'sp-l-zone-north' },
  { id: 'sp-l1-retail-c', name: 'L1 Sports Hub', type: 'retail' as const, center: [34, 22] as [number, number], size: [22, 18] as [number, number], zoneId: 'sp-l-zone-north' },
  { id: 'sp-l1-corridor', name: 'Blue Atrium Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 12] as [number, number], zoneId: 'sp-l-zone-atrium' },
  { id: 'sp-l1-retail-d', name: 'L1 Electronics Strip', type: 'retail' as const, center: [-30, -20] as [number, number], size: [30, 18] as [number, number], zoneId: 'sp-l-zone-south' },
  { id: 'sp-l1-retail-e', name: 'L1 East Wing Retail', type: 'retail' as const, center: [8, -20] as [number, number], size: [24, 18] as [number, number], zoneId: 'sp-l-zone-south' },
  { id: 'sp-l1-office', name: 'Operations Office', type: 'office' as const, center: [34, -20] as [number, number], size: [22, 18] as [number, number], zoneId: 'sp-l-zone-south' },
  { id: 'sp-l1-toilet', name: 'Public Toilet L1', type: 'toilet' as const, center: [42, -2] as [number, number], size: [10, 8] as [number, number], zoneId: 'sp-l-zone-atrium' },
  { id: 'sp-l1-plant', name: 'Escalator Drive Room', type: 'plant_room' as const, center: [-44, -2] as [number, number], size: [8, 10] as [number, number], zoneId: 'sp-l-zone-atrium' },
];

const l2Rooms = [
  { id: 'sp-l2-retail-a', name: 'L2 Family Retail', type: 'retail' as const, center: [-30, 22] as [number, number], size: [30, 18] as [number, number], zoneId: 'sp-l-zone-north' },
  { id: 'sp-l2-food-court', name: 'L2 Ice Dining Hall', type: 'food_court' as const, center: [12, 22] as [number, number], size: [46, 18] as [number, number], zoneId: 'sp-l-zone-north' },
  { id: 'sp-l2-corridor', name: 'L2 Atrium Corridor', type: 'corridor' as const, center: [0, 0] as [number, number], size: [96, 12] as [number, number], zoneId: 'sp-l-zone-atrium' },
  { id: 'sp-l2-retail-b', name: 'L2 Kids Retail', type: 'retail' as const, center: [-30, -20] as [number, number], size: [30, 18] as [number, number], zoneId: 'sp-l-zone-south' },
  { id: 'sp-l2-office', name: 'Event Management Office', type: 'office' as const, center: [-2, -20] as [number, number], size: [22, 18] as [number, number], zoneId: 'sp-l-zone-south' },
  { id: 'sp-l2-plant', name: 'Ice Rink Plant Room', type: 'plant_room' as const, center: [24, -20] as [number, number], size: [18, 18] as [number, number], zoneId: 'sp-l-zone-south' },
  { id: 'sp-l2-toilet', name: 'Public Toilet L2', type: 'toilet' as const, center: [42, -2] as [number, number], size: [10, 8] as [number, number], zoneId: 'sp-l-zone-atrium' },
];

export const floors: FloorPlanFloor[] = [
  buildFloor({
    siteId: 'site-2',
    id: 'B3',
    name: 'Basement 3',
    level: -3,
    zones: basementZones,
    rooms: b3Rooms,
    assetPlacements: [
      { assetId: 'asset-19', roomId: 'sp-b3-plant-a', zoneId: 'sp-b-zone-south', offset: [-36, -22] },
      { assetId: 'asset-20', roomId: 'sp-b3-plant-a', zoneId: 'sp-b-zone-south', offset: [-28, -22] },
      { assetId: 'asset-21', roomId: 'sp-b3-plant-b', zoneId: 'sp-b-zone-south', offset: [-8, -22] },
      { assetId: 'asset-22', roomId: 'sp-b3-plant-c', zoneId: 'sp-b-zone-south', offset: [16, -22] },
      { assetId: 'asset-23', roomId: 'sp-b3-plant-c', zoneId: 'sp-b-zone-south', offset: [24, -22] },
      { assetId: 'asset-27', roomId: 'sp-b3-plant-c', zoneId: 'sp-b-zone-south', offset: [20, -26] },
      { assetId: 'asset-29', roomId: 'sp-b3-plant-c', zoneId: 'sp-b-zone-south', offset: [12, -25] },
    ],
  }),
  buildFloor({
    siteId: 'site-2',
    id: 'B2',
    name: 'Basement 2',
    level: -2,
    zones: basementZones,
    rooms: b2Rooms,
    assetPlacements: [
      { assetId: 'asset-17', roomId: 'sp-b2-plant-a', zoneId: 'sp-b-zone-south', offset: [-27, -21] },
      { assetId: 'asset-18', roomId: 'sp-b2-plant-b', zoneId: 'sp-b-zone-south', offset: [3, -21] },
    ],
  }),
  buildFloor({
    siteId: 'site-2',
    id: 'B1',
    name: 'Basement 1',
    level: -1,
    zones: basementZones,
    rooms: b1Rooms,
    assetPlacements: [
      { assetId: 'asset-51', roomId: 'sp-b1-office-west', zoneId: 'sp-b-zone-north', offset: [-30, 20] },
    ],
  }),
  buildFloor({
    siteId: 'site-2',
    id: 'L1',
    name: 'Level 1',
    level: 1,
    zones: retailZones,
    rooms: l1Rooms,
    assetPlacements: [
      { assetId: 'asset-24', roomId: 'sp-l1-corridor', zoneId: 'sp-l-zone-atrium', offset: [-8, 0] },
      { assetId: 'asset-26', roomId: 'sp-l1-corridor', zoneId: 'sp-l-zone-atrium', offset: [10, 1] },
      { assetId: 'asset-54', roomId: 'sp-l1-corridor', zoneId: 'sp-l-zone-atrium', offset: [18, -1] },
    ],
  }),
  buildFloor({
    siteId: 'site-2',
    id: 'L2',
    name: 'Level 2',
    level: 2,
    zones: retailZones,
    rooms: l2Rooms,
    assetPlacements: [
      { assetId: 'asset-25', roomId: 'sp-l2-corridor', zoneId: 'sp-l-zone-atrium', offset: [-6, 0] },
      { assetId: 'asset-28', roomId: 'sp-l2-plant', zoneId: 'sp-l-zone-south', offset: [23, -20] },
    ],
  }),
];

