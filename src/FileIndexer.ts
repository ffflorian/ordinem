import * as fs from 'fs-extra';
import * as low from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileAsync';
import * as path from 'path';
import * as shortid from 'shortid';

import {ExtendedLogger} from './util';

interface OrdinemData {
  files: FileIndex;
}

type FileIndex = Array<FileEntry | DirEntry>;

interface IndexEntry {
  id: string;
  fullPath: string;
  name: string;
  path: string;
  type: 'file' | 'dir';
}

interface FileEntry extends IndexEntry {
  size: number;
  type: 'file';
}

interface DirEntry extends IndexEntry {
  type: 'dir';
}

class FileIndexer {
  private readonly baseDir: string;
  private readonly logger: ExtendedLogger;
  private db?: low.LowdbAsync<OrdinemData>;
  private readonly adapter: low.AdapterAsync<OrdinemData>;
  private readonly root: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.logger = new ExtendedLogger('FileIndexer');
    this.adapter = new FileSync('db.json');
    this.db = undefined;
    this.root = path.resolve(__dirname);
  }

  public async init(): Promise<void> {
    if (this.db) {
      throw new Error('Database already initialized.');
    }
    try {
      this.db = await low(this.adapter);
      await this.db.defaults({files: []}).write();
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async updateIndex(reason: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    this.logger.info(`Updating file index (reason: ${reason}) ...`);
    const files = await this.walkAsync(this.baseDir);
    this.db.set('files', files).write();
    const foundFiles = files.filter(file => file.type === 'file').length;
    this.logger.info(`Updated file index. Found ${foundFiles} files.`);
  }

  private async walkAsync(dir: string): Promise<FileIndex> {
    const resolvedDir = path.resolve(dir);
    let fileIndex: FileIndex = [
      {
        fullPath: resolvedDir + path.sep,
        id: shortid.generate(),
        name: path.basename(resolvedDir),
        path: resolvedDir.replace(this.root, ''),
        type: 'dir',
      },
    ];

    this.logger.info(`Walking dir "${resolvedDir}" ...`);

    try {
      const dirObjects = await fs.readdir(resolvedDir);

      await Promise.all(
        dirObjects.map(async fileName => {
          const resolvedFile = path.join(resolvedDir, fileName);
          const lstat = await fs.lstat(resolvedFile);

          if (lstat.isFile()) {
            this.logger.info(`Found file "${resolvedFile}".`);
            fileIndex.push({
              fullPath: resolvedFile,
              id: shortid.generate(),
              name: path.basename(resolvedFile),
              path: resolvedFile.replace(this.root, ''),
              size: lstat.size,
              type: 'file',
            });
          } else {
            this.logger.info(`Found dir "${resolvedFile}".`);
            const deepIndex = await this.walkAsync(resolvedFile);
            fileIndex = fileIndex.concat(deepIndex);
          }
        })
      );
    } catch (error) {
      this.logger.error(error);
    }

    return fileIndex.sort((a, b) => {
      if (a.path < b.path) {
        return -1;
      }
      if (a.path > b.path) {
        return 1;
      }
      return 0;
    });
  }

  public async getFile(filename: string): Promise<FileEntry | undefined> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const dataWrapper = await this.db.get('files').find({path: filename});
    const value = dataWrapper.value();
    if (value && value.type === 'file') {
      return value;
    }
    return undefined;
  }

  public async getFiles(): Promise<FileIndex> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const dataWrapper = await this.db.get('files');
    return dataWrapper.value();
  }
}

export {FileIndexer};
