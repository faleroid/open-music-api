const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, {
    storageService, albumsService, validator, cacheService,
  }) => {
    const uploadsHandler = new UploadsHandler(
      storageService,
      albumsService,
      validator,
      cacheService,
    );

    server.route(routes(uploadsHandler));
  },
};
