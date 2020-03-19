import * as program from 'commander';
import {cosmiconfig} from 'cosmiconfig';

import {ServerConfig, defaultConfig} from './config';
import {OrdinemServer} from './Server';
import {ExtendedLogger} from './util';

const logger = new ExtendedLogger('cli');

const {name, version, description}: {description: string; name: string; version: string} = require('../package.json');

program
  .name(name)
  .description(description)
  .option('--noconfig', `don't look for a configuration file`)
  .option('-p, --port <port>', 'set the server port', defaultConfig.port.toString())
  .option('-d, --dir <dir>', 'set the directory to serve', defaultConfig.dir)
  .version(version, '-v, --version')
  .parse(process.argv);

(async () => {
  let config: ServerConfig = {};

  if (program.noconfig) {
    logger.info('Not using any configuration file');
  } else {
    const result = await cosmiconfig('ordinem').search();
    if (result) {
      logger.info(`Found configuration file ${result.filepath}`);
      config = result.config;
    }
  }

  config = {
    ...config,
    ...(program.port && {port: program.port}),
    ...(program.dir && {dir: program.dir}),
  };

  logger.info(`Configuration: ${JSON.stringify(config)}`);

  const server = new OrdinemServer(config);

  try {
    const port = await server.start();
    logger.info(`Server is running on port ${port}.`);
  } catch (error) {
    logger.error(error.stack);
  }

  process.on('SIGINT', () =>
    server
      .stop()
      .then(() => logger.info('Server stopped.'))
      .catch(logger.error)
  );

  process.on('uncaughtException', error => {
    logger.error(`Uncaught exception: ${error.message}`, error);
  });

  process.on('unhandledRejection', (reason, promise) =>
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  );
})().catch(logger.error);
