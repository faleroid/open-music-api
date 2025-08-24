const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator, cacheService }) => {
    const handler = new SongsHandler(service, validator, cacheService);
    server.route(routes(handler));
  },
};
