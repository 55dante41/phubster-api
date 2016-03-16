var util = require('util');

var UserAlreadyExistsError = function() {
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 400;
    this.statusMessage = 'User already exists.'
};
util.inherits(UserAlreadyExistsError, Error);

module.exports = UserAlreadyExistsError;
