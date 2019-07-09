import {CronJob} from 'cron';
import * as hapi from 'hapi';
import * as path from 'path';

import {ServerConfig, defaultConfig} from './config';
import {FileIndexer} from './FileIndexer';
import {FileRoute} from './routes';

class OrdinemServer {
  private readonly options: Required<ServerConfig>;
  private readonly hapi: hapi.Server;
  private readonly fileIndexer: FileIndexer;
  private readonly cronjob: CronJob;

  constructor(options?: ServerConfig) {
    this.options = {
      ...defaultConfig,
      ...options,
    };

    this.hapi = new hapi.Server({
      host: 'localhost',
      port: this.options.port,
    });

    this.options.dir = path.resolve(this.options.dir);

    this.fileIndexer = new FileIndexer(this.options.dir);
    this.cronjob = new CronJob('0 * * * * *', async () => {
      await this.fileIndexer.updateIndex('CronJob');
    });

    this.init();
  }

  public async start(): Promise<number> {
    await this.hapi.start();
    await this.fileIndexer.updateIndex('server start');
    return this.options.port;
  }

  public async stop(): Promise<void> {
    await this.hapi.stop();
    this.cronjob.stop();
  }

  private init(): void {
    this.hapi.route({
      handler: () => ({
        status: 'ready',
      }),
      method: 'GET',
      path: '/',
    });
    this.hapi.route(FileRoute(this.fileIndexer));
    this.cronjob.start();
  }
}

export {OrdinemServer};
