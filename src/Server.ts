import {CronJob} from 'cron';
import * as handlebars from 'handlebars';
import * as hapi from 'hapi';
import * as path from 'path';
import * as vision from 'vision';

import {ServerConfig, defaultConfig} from './config';
import {FileIndexer} from './FileIndexer';
import {FileRoute, FilesRoute} from './routes';

class OrdinemServer {
  private readonly cronjob: CronJob;
  private readonly fileIndexer: FileIndexer;
  private readonly server: hapi.Server;
  private readonly options: Required<ServerConfig>;

  constructor(options?: ServerConfig) {
    this.options = {
      ...defaultConfig,
      ...options,
    };

    this.server = new hapi.Server({
      host: 'localhost',
      port: this.options.port,
    });

    this.options.dir = path.resolve(this.options.dir);

    this.fileIndexer = new FileIndexer(this.options.dir);
    this.cronjob = new CronJob({
      cronTime: '0 * * * * *',
      onTick: () => this.fileIndexer.updateIndex('CronJob'),
      runOnInit: false,
      unrefTimeout: true,
    });

    process.on('beforeExit', () => this.cronjob.stop());
  }

  public async init(): Promise<void> {
    await this.fileIndexer.init();

    this.server.route({
      handler: (req, toolkit) => {
        const data = {
          status: 'ready',
        };
        return toolkit.view('index', data);
      },
      method: 'GET',
      path: '/',
    });

    this.server.route(FilesRoute(this.fileIndexer));
    this.server.route(FileRoute(this.fileIndexer));

    await this.server.register(vision);

    this.server.views({
      engines: {
        hbs: handlebars,
      },
      //layout: true,
      //layoutPath: '../templates/layout/layout',
      path: '../templates',
      relativeTo: __dirname,
    });

    await this.fileIndexer.updateIndex('server start');

    this.cronjob.start();
  }

  public async start(): Promise<number> {
    await this.server.start();
    return this.options.port;
  }

  public async stop(): Promise<void> {
    await this.server.stop();
    this.cronjob.stop();
  }
}

export {OrdinemServer};
