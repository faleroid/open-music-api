const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist(name, owner);

    return h
      .response({
        status: 'success',
        data: { playlistId },
      })
      .code(201);
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(owner);

    return {
      status: 'success',
      data: { playlists },
    };
  }

  async deletePlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, userId);
    await this._service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
