import type { Application } from '@feathersjs/feathers';
import { MemoryService } from '@feathersjs/memory';

export const workOrdersService = (app: Application) => {
  app.use('work-orders', new MemoryService({
    paginate: {
      default: 25,
      max: 100,
    },
  }));
};
