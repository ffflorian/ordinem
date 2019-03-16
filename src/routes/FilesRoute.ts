import {ServerRoute} from 'hapi';
import {FileIndexer} from '../FileIndexer';

const FileRoute = (fileIndexer: FileIndexer): ServerRoute => ({
  handler: () => ({
    files: fileIndexer.getFiles(),
    result: 'success',
  }),
  method: 'GET',
  path: '/files',
});

export {FileRoute};
