const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const handler = new PlaylistsHandler(service, validator);
    server.route(routes(handler));
  },
};
