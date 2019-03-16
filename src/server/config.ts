interface ServerConfig {
  /** set the server port */
  dir?: string;
  /** set the directory to serve */
  port?: number;
}

const defaultConfig: Required<ServerConfig> = {
  dir: '.',
  port: 8000,
};

export {defaultConfig, ServerConfig};
