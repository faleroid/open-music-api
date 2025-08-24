const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  register: async (
    server,
    { collaborationsService, playlistsService, validator },
  ) => {
    const handler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      validator,
    );
    server.route(routes(handler));
  },
};
