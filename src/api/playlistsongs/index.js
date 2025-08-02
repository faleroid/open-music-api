const routes = require('./routes');
const PlaylistSongsHandler = require('./handler');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    songsService,
    playlistActivitiesService,
    playlistSongsService,
    validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
        playlistsService,
        songsService,
        playlistActivitiesService,
        playlistSongsService,
        validator,
    );
    server.route(routes(playlistSongsHandler));
  },
};
