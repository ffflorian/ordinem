import * as logdown from 'logdown';

const logger = logdown('ordinem/cli', {
  logger: console,
  markdown: false,
});

import {OrdinemServer} from './Server';
import {formatDate} from './util';

const server = new OrdinemServer();

server
  .start()
  .then(port => logger.info(`[${formatDate()}] Server is running on port ${port}.`))
  .catch(error => logger.error(`[${formatDate()}] ${error.stack}`));

process.on('SIGINT', () => server.stop().then(() => logger.info(`[${formatDate()}] Server stopped.`)));

process.on('uncaughtException', error => {
  logger.error(`[${formatDate()}] Uncaught exception: ${error.message}`, error);
});

process.on('unhandledRejection', (error, promise) => {
  const log = (error: Error | {}) => logger.error(`[${formatDate()}] Uncaught rejection`, error);
  promise.catch(log);
  if (error) {
    log(error);
  }
});
