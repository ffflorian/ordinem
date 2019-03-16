interface ServerConfig {
  dir?: string;
  port?: number;
}

const defaultConfig: Required<ServerConfig> = {
  dir: '.',
  port: 8000,
};

export {defaultConfig, ServerConfig};
