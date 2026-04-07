import type { Application } from '@feathersjs/feathers';
import { MemoryService } from '@feathersjs/memory';

export const pmSchedulesService = (app: Application) => {
  app.use('pm-schedules', new MemoryService({
    paginate: {
      default: 25,
      max: 100,
    },
  }));
};
