var util = require('util');

var UserNotFoundError = function() {
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 405;
    this.statusMessage = 'User not found.'
};
util.inherits(UserNotFoundError, Error);

module.exports = UserNotFoundError;
