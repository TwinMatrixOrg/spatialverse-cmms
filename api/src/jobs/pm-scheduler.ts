import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../logger';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Queue for PM schedule processing
export const pmScheduleQueue = new Queue('pm-schedules', { connection });

// Worker to process PM schedules and generate work orders
export const pmScheduleWorker = new Worker(
  'pm-schedules',
  async (job) => {
    const { pmScheduleId, assetId, siteId, name } = job.data;

    logger.info(`Processing PM schedule: ${name} (${pmScheduleId})`);

    try {
      // In production, this would:
      // 1. Check if the PM schedule is due
      // 2. Create a new work order from the PM schedule
      // 3. Update the PM schedule's next due date
      // 4. Send notifications to assigned technicians

      logger.info(`Successfully processed PM schedule: ${pmScheduleId}`);
      return { success: true, pmScheduleId };
    } catch (error) {
      logger.error(`Failed to process PM schedule: ${pmScheduleId}`, error);
      throw error;
    }
  },
  { connection }
);

// Schedule daily check for PM schedules
export const schedulePMCheck = async () => {
  await pmScheduleQueue.add(
    'daily-pm-check',
    { timestamp: new Date().toISOString() },
    {
      repeat: {
        pattern: '0 6 * * *', // Run at 6 AM daily
      },
    }
  );
  logger.info('PM schedule daily check configured');
};

pmScheduleWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

pmScheduleWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});
