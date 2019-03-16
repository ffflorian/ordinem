import * as fs from 'fs-extra';
import * as path from 'path';

import {ExtendedLogger} from './util';

interface File {
  size: number;
  type: 'file';
}

interface Dir {
  index: Index;
  type: 'dir';
}

interface Index {
  [name: string]: File | Dir;
}

class FileIndexer {
  private readonly baseDir: string;
  private readonly logger: ExtendedLogger;
  private fileIndex: Dir;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.logger = new ExtendedLogger('FileIndexer');
    this.fileIndex = {
      index: {},
      type: 'dir',
    };
  }

  public async updateIndex(reason: string): Promise<void> {
    this.logger.info(`Updating file index (reason: ${reason}) ...`);
    const [newIndex, foundFiles] = await this.walkAsync(this.baseDir);
    this.fileIndex = newIndex;
    this.logger.info(`Updated file index. Found ${foundFiles} files.`);
  }

  private async walkAsync(dir: string): Promise<[Dir, number]> {
    let foundFiles = 0;
    const resolvedDir = path.resolve(dir);
    const dirIndex: Index = {};

    this.logger.info(`Walking dir "${resolvedDir}" ...`);

    try {
      const dirObjects = await fs.readdir(resolvedDir);

      await Promise.all(
        dirObjects.map(async fileName => {
          const resolvedFile = path.join(resolvedDir, fileName);
          const lstat = await fs.lstat(resolvedFile);

          if (lstat.isFile()) {
            this.logger.info(`Found file "${resolvedFile}".`);
            dirIndex[resolvedFile] = {
              size: lstat.size,
              type: 'file',
            };
            foundFiles++;
          } else {
            this.logger.info(`Found dir "${resolvedFile}".`);
            const [deepIndex, deepFoundFiles] = await this.walkAsync(resolvedFile);
            dirIndex[resolvedFile] = deepIndex;
            foundFiles += deepFoundFiles;
          }
        })
      );
    } catch (error) {
      this.logger.error(error);
    }
    return [
      {
        index: dirIndex,
        type: 'dir',
      },
      foundFiles,
    ];
  }

  public getFiles(): Dir {
    return this.fileIndex;
  }
}

export {FileIndexer};
