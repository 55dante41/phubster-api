var jwt = require('jsonwebtoken');

var authConfig = require(process.cwd() + '/config/auth.js');

exports.generateAccessToken = function(payload) {
    return jwt.sign(payload, authConfig.jwtSecret, {
        expiresInMinutes: 14400
    });
};
