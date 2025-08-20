const joi = require("joi");

const SongPayloadSchema = joi.object({
  title: joi.string().required(),
  year: joi.number().required(),
  performer: joi.string().required(),
  genre: joi.string().required(),
  duration: joi.number().allow(null),
  albumId: joi.string().allow(null),
});

module.exports = { SongPayloadSchema };
