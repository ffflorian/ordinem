# ordinem [![Build Status](https://github.com/ffflorian/ordinem/workflows/Build/badge.svg)](https://github.com/ffflorian/ordinem/actions/) [![npm version](https://img.shields.io/npm/v/ordinem.svg?style=flat)](https://www.npmjs.com/package/ordinem) [![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=ffflorian/ordinem)](https://dependabot.com)

:open_file_folder: A media library server and browser.

## Installation

Run `yarn global add ordinem` or `npm i -g ordinem`.

## Usage

### Configuration file

To use a configuration file, add a configuration file following the [cosmiconfig standard](https://github.com/davidtheclark/cosmiconfig#cosmiconfig) (e.g. `.ordinemrc.json`) to your project and the ordinem CLI will find it automatically. Options from the CLI still take precedence over the configuration file.

The structure of the configuration file is the following:

```ts
{
  /** set the server port */
  dir?: string;

  /** set the directory to serve */
  port?: number;
}
```

### CLI

```
Usage: ordinem [options]

A media library server and browser.

Options:
  --noconfig         don't look for a configuration file
  -p, --port <port>  set the server port (default: 8000)
  -d, --dir <dir>    set the directory to serve (default: ".")
  -v, --version      output the version number
  -h, --help         output usage information
```
