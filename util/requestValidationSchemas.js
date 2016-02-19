var Joi = require('joi');

module.exports = {
	'user_addUser': Joi.object().keys({
		'userName': Joi.string().required(),
		'email': Joi.email().required(),
		'fullName': Joi.string().required()
	})
};