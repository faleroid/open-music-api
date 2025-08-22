const autoBind = require('auto-bind');

class PlaylistActivitiesHandler {
  constructor(service, playlistsService) {
    this._service = service;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async getActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const result = await this._service.getActivities(playlistId);

    return {
      status: "success",
      data: result,
    };
  }
}

module.exports = PlaylistActivitiesHandler;
