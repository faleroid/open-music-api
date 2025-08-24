const PlaylistActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistActivities',
  register: async (server, { service, playlistsService }) => {
    const handler = new PlaylistActivitiesHandler(service, playlistsService);
    server.route(routes(handler));
  },
};
