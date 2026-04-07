import type { Application } from '@feathersjs/feathers';
import { assetsService } from './assets/assets.service';
import { workOrdersService } from './work-orders/work-orders.service';
import { pmSchedulesService } from './pm-schedules/pm-schedules.service';
import { contractorsService } from './contractors/contractors.service';
import { inventoryService } from './inventory/inventory.service';

export const services = (app: Application) => {
  app.configure(assetsService);
  app.configure(workOrdersService);
  app.configure(pmSchedulesService);
  app.configure(contractorsService);
  app.configure(inventoryService);
};
