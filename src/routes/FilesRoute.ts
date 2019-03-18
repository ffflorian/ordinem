import {ServerRoute} from 'hapi';
import {FileIndexer} from '../FileIndexer';

const FileRoute = (fileIndexer: FileIndexer): ServerRoute => {
  return {
    handler: async (req, toolkit) => {
      const file = await fileIndexer.getFile(req.params.file);
      const data = {
        file,
        result: 'success',
      };
      return toolkit.view('file', data);
    },
    method: 'GET',
    path: '/file/{file}',
  };
};

const FilesRoute = (fileIndexer: FileIndexer): ServerRoute => {
  return {
    handler: async (req, toolkit) => {
      const files = await fileIndexer.getFiles();
      const data = {
        files,
        result: 'success',
      };
      return toolkit.view('files', data);
    },
    method: 'GET',
    path: '/files',
  };
};

export {FileRoute, FilesRoute};
