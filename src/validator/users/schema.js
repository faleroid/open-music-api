const Joi = require("joi");

const UserPayloadSchema = Joi.object({
  username: Joi.string().max(50).required(),
  password: Joi.string().required(),
  fullname: Joi.string().max(150).required(),
});

module.exports = { UserPayloadSchema };
