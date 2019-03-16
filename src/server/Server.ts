import * as hapi from 'hapi';
import * as path from 'path';

import {ServerConfig, defaultConfig} from './config';

class OrdinemServer {
  private readonly options: Required<ServerConfig>;
  private readonly hapi: hapi.Server;

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
  }

  public async start(): Promise<number> {
    await this.hapi.start();
    return this.options.port;
  }

  public async stop(): Promise<void> {
    await this.hapi.stop();
  }
}

export {OrdinemServer};
