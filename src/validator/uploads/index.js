const InvariantError = require('../../exceptions/InvariantError');
const { coverAlbumSchema } = require('./schema');

const UploadsValidator = {
  validateCoverAlbum: (headers) => {
    const validationResult = coverAlbumSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsValidator;
