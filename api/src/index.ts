import { app } from './app';
import { logger } from './logger';

const port = process.env.PORT || 9002;
const host = process.env.HOST || 'localhost';

app.listen(port).then(() => {
  logger.info(`SpatialVerse CMMS API listening on http://${host}:${port}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});
