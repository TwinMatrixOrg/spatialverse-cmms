import type { Application } from '@feathersjs/feathers';
import { MemoryService } from '@feathersjs/memory';

export const inventoryService = (app: Application) => {
  app.use('inventory', new MemoryService({
    paginate: {
      default: 25,
      max: 100,
    },
  }));
};
