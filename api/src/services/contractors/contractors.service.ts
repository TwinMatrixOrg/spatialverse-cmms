import type { Application } from '@feathersjs/feathers';
import { MemoryService } from '@feathersjs/memory';

export const contractorsService = (app: Application) => {
  app.use('contractors', new MemoryService({
    paginate: {
      default: 25,
      max: 100,
    },
  }));
};
