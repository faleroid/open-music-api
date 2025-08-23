const autoBind = require("auto-bind");

class AlbumsHandler {
  constructor(service, validator, cacheService) {
    this._service = service;
    this._validator = validator;
    this._cacheService = cacheService;

    autoBind(this);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.addAlbumLike(albumId, userId);
    await this._cacheService.delete(`album-likes:${albumId}`);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteAlbumLike(albumId, userId);
    await this._cacheService.delete(`album-likes:${albumId}`);

    return {
      status: 'success',
      message: 'Batal menyukai album berhasil',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const cacheKey = `album-likes:${albumId}`;

    try {
      const likes = await this._cacheService.get(cacheKey);
      
      const response = h.response({
        status: 'success',
        data: {
          likes: JSON.parse(likes),
        },
      });

      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      const likes = await this._service.getAlbumLikesCount(albumId);
      
      await this._cacheService.set(cacheKey, JSON.stringify(likes));
      
      return {
        status: 'success',
        data: {
          likes,
        },
      };
    }
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({name, year });

    return h
      .response({
        status: "success",
        data: {
          albumId,
        },
      })
      .code(201);
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);

    return {
      status: "success",
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: "success",
      message: "Album berhasil diperbarui",
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: "success",
      message: "Album berhasil dihapus",
    };
  }
}

module.exports = AlbumsHandler;
