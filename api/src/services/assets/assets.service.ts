import type { Application } from '@feathersjs/feathers';
import { MemoryService } from '@feathersjs/memory';

export const assetsService = (app: Application) => {
  app.use('assets', new MemoryService({
    paginate: {
      default: 25,
      max: 100,
    },
  }));
};
