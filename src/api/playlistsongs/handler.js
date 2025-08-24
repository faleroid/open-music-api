const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(
    playlistsService,
    songsService,
    playlistActivitiesService,
    playlistSongsService,
    validator,
  ) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._playlistSongsService = playlistSongsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { songId } = request.payload;

      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId,
      );
      await this._songsService.getSongById(songId);
      await this._playlistSongsService.addSongToPlaylist(playlistId, songId);
      await this._playlistActivitiesService.addActivity(
        playlistId,
        songId,
        credentialId,
        'add',
      );

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });
      response.code(201);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPlaylistSongsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistSongsService.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId); // perbaiki di sini
    await this._playlistActivitiesService.addActivity(
      playlistId,
      songId,
      credentialId,
      'delete',
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;
