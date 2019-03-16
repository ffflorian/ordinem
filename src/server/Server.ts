import * as hapi from 'hapi';

interface ServerOptions {
  port?: number;
}

const defaultOptions: Required<ServerOptions> = {
  port: 8000,
};

class OrdinemServer {
  private readonly options: Required<ServerOptions>;
  private readonly hapi: hapi.Server;

  constructor(options?: ServerOptions) {
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.hapi = new hapi.Server({
      host: 'localhost',
      port: this.options.port,
    });
  }

  public async start(): Promise<number> {
    await this.hapi.start();
    return this.options.port;
  }

  public async stop(): Promise<void> {
    await this.hapi.stop();
  }
}

export {OrdinemServer, ServerOptions};
