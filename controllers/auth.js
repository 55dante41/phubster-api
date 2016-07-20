var jwt = require('jsonwebtoken');

var authConfig = require(process.cwd() + '/config/auth.js');
var User = require(process.cwd() + '/models/user.js');

exports.getAuthenticationToken = function(req, res, next) {
    var query = {};

    if (req.body.userName) {
        query = {
            userName: req.body.userName
        };
    } else if (req.body.emailAddress) {
        query = {
            emailAddress: req.body.emailAddress
        };
    } else if (req.body.mobileNumber) {
        query = {
            mobileNumber: req.body.mobileNumber
        };
    } else {
        res.status(403)
            .send({
                success: false,
                message: 'userName/emailAddress required'
            });
        return;
    }

    // Get the request user from database
    User.findOne(query, function(err, foundUser) {
        // Send 500 status in case of any db errors
        if (err) {
            res.status(500)
                .send({
                    success: false,
                    message: 'Internal Server Error'
                });
            return;
        }
        if (foundUser) {
            var payload = {
                'userName': foundUser.userName,
                'emailAddress': foundUser.emailAddress,
                'mobileNumber': foundUser.mobileNumber
            };
            var token;
            if (foundUser.source == 'gplus') {
                // if user is signed up from google plus
                // look for gPlusAccessToken
                if (!req.body.gPlusId) {
                    res.status(403)
                        .send({
                            success: false,
                            message: 'gPlusId required'
                        });
                    return;
                }
                if (req.body.gPlusId == foundUser.gPlus.id) {
                    token = jwt.sign(payload, authConfig.jwtSecret, {
                        expiresInMinutes: 14400
                    });
                    res.cookie('accessToken', token, {
                        'maxAge': 86400000
                    });
                    res.status(200)
                        .send({
                            success: true,
                            message: 'Authentication successful',
                            token: token
                        });
                    return;
                } else {
                    res.status(403)
                        .send({
                            success: false,
                            message: 'Wrong Google plus access token'
                        });
                    return;
                }
            } else if (foundUser.source == 'fb') {
                if (!req.body.fbId) {
                    res.status(403)
                        .send({
                            success: false,
                            message: 'fbId required'
                        });
                    return;
                }
                if (req.body.fbId == foundUser.facebook.id) {
                    token = jwt.sign(payload, authConfig.jwtSecret, {
                        expiresInMinutes: 14400
                    });
                    res.cookie('accessToken', token, {
                        'maxAge': 86400000
                    });
                    res.status(200)
                        .send({
                            success: true,
                            message: 'Authentication successful',
                            token: token
                        });
                    return;
                } else {
                    res.status(403)
                        .send({
                            success: false,
                            message: 'Wrong facebook access token'
                        });
                    return;
                }
            } else if (req.body.gPlusId) {
                if (foundUser.gPlus.id) {
                    if (foundUser.gPlus.id == req.body.gPlusId) {
                        token = jwt.sign(payload, authConfig.jwtSecret, {
                            expiresInMinutes: 14400
                        });
                        res.cookie('accessToken', token, {
                            'maxAge': 86400000
                        });
                        res.status(200)
                            .send({
                                success: true,
                                message: 'Authentication successful',
                                token: token
                            });
                        return;
                    } else {
                        res.status(403)
                            .send({
                                success: false,
                                message: 'Credentials does not match'
                            });
                        return;
                    }
                } else {
                    foundUser.gPlus = {
                        id: req.body.gPlusId
                    };
                    foundUser.save(function(err) {
                        token = jwt.sign(payload, authConfig.jwtSecret, {
                            expiresInMinutes: 14400
                        });
                        res.cookie('accessToken', token, {
                            'maxAge': 86400000
                        });
                        res.status(200)
                            .send({
                                success: true,
                                message: 'Authentication successful',
                                token: token
                            });
                        return;
                    });
                }
            } else if (req.body.fbId) {
                if (foundUser.facebook.id) {
                    if (foundUser.facebook.id == req.body.fbId) {
                        token = jwt.sign(payload, authConfig.jwtSecret, {
                            expiresInMinutes: 14400
                        });
                        res.cookie('accessToken', token, {
                            'maxAge': 86400000
                        });
                        res.status(200)
                            .send({
                                success: true,
                                message: 'Authentication successful',
                                token: token
                            });
                        return;
                    } else {
                        res.status(403)
                            .send({
                                success: false,
                                message: 'Credentials does not match'
                            });
                        return;
                    }
                } else {
                    foundUser.facebook = {
                        id: req.body.fbId
                    };
                    foundUser.save(function(err) {
                        token = jwt.sign(payload, authConfig.jwtSecret, {
                            expiresInMinutes: 14400
                        });
                        res.cookie('accessToken', token, {
                            'maxAge': 86400000
                        });
                        res.status(200)
                            .send({
                                success: true,
                                message: 'Authentication successful',
                                token: token
                            });
                        return;
                    });
                }
            } else {
                if (!req.body.password) {
                    res.status(403)
                        .send({
                            success: false,
                            message: 'Password required'
                        });
                    return;
                }
                foundUser.verifyPassword(req.body.password, function(err, isMatch) {
                    if (err) {
                        res.status(403)
                            .send({
                                success: false,
                                message: 'Wrong password',
                                error: err
                            });
                        return;
                    }
                    if (isMatch) {
                        var token = jwt.sign(payload, authConfig.jwtSecret, {
                            expiresInMinutes: 14400
                        });
                        res.cookie('accessToken', token, {
                            'maxAge': 86400000
                        });
                        res.status(200)
                            .send({
                                success: true,
                                message: 'Authentication successful',
                                token: token
                            });
                        return;
                    } else {
                        res.status(403)
                            .send({
                                success: false,
                                message: 'Wrong password'
                            });
                        return;
                    }
                });
            }
        } else {
            res.status(404)
                .send({
                    success: false,
                    message: 'User not found'
                });
            return;
        }
    });
};

exports.isTokenAuthenticated = function(req, res, next) {
    // get the token from the request
    console.log(req.session);
    var token = req.cookies['accessToken'] || req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        //if token found, verify it against the secret
        console.log('token :' + token);
        jwt.verify(token, authConfig.jwtSecret, function(err, decodedToken) {
            if (err) {
                // if verification failed, send status 403 Forbidden
                res.status(403)
                    .send({
                        success: false,
                        message: 'Failed to authenticate token with token ' + token,
                        error: err
                    });
                return;
            }
            // verification passed, put the decodedToken onto request object (req)
            // and move on to the next tick
            console.log('decoded token:', JSON.stringify(decodedToken));
            var findQuery = {
                $or: []
            };
            if (decodedToken.userName) {
                findQuery['$or'].push({
                    userName: decodedToken.userName
                });
            }
            if (decodedToken.emailAddress) {
                findQuery['$or'].push({
                    emailAddress: decodedToken.emailAddress
                });
            }
            if (decodedToken.mobileNumber) {
                findQuery['$or'].push({
                    mobileNumber: decodedToken.mobileNumber
                });
            }
            console.log('find query', JSON.stringify(findQuery));
            User
                .findOne(findQuery)
                .select('-password')
                .exec()
                .then(function(foundUser) {
                    if (foundUser) {
                        req.user = foundUser; //putting the user ojbect into the req object, saved in session
                        req.decodedToken = decodedToken;
                        next();
                    } else {
                        throw new Error('User not found.');
                    }
                })
                .catch(function(error) {
                    res
                        .status(500)
                        .send({
                            success: false,
                            message: 'Server error while authenticating, please try again.',
                            error: error
                        });
                    return;
                });
        });
    } else {
        //if no token is found, send status 403 Forbidden
        res.status(403)
            .send({
                success: false,
                message: 'No token provided'
            });
        return;
    }
};
