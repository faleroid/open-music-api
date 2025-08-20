class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._service = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadCoverAlbum = this.postUploadCoverAlbum.bind(this);
  }

  async postUploadCoverAlbum(request, h) {
    const { cover } = request.payload;
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.verifyAlbumOwner(albumId, userId);
    this._validator.validateCoverAlbum(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._albumsService.editAlbumCoverById(albumId, coverUrl);

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
