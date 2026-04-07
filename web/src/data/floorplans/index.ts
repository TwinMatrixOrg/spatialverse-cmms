import { sites } from '../mockData';
import { floors as pavilionKLFloors } from './pavilion-kl';
import { floors as sunwayPyramidFloors } from './sunway-pyramid';
import { floors as midValleyFloors } from './mid-valley';

export const floorPlansByBuilding = {
  'site-1': pavilionKLFloors,
  'site-2': sunwayPyramidFloors,
  'site-3': midValleyFloors,
};

export const floorPlanBuildings = sites
  .filter((site) => Boolean(floorPlansByBuilding[site.id as keyof typeof floorPlansByBuilding]))
  .map((site) => ({
    id: site.id,
    name: site.name,
  }));

