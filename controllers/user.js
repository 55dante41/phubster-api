var User = require(process.cwd() + '/models/user.js');
var authHelper = require(process.cwd() + '/helpers/auth.js');
var Joi = require('joi');

exports.getUser = function(req, res) {
    res.status(200).send({
        success: true,
        message: 'Authentication successful; User found',
        user: req.user
    });
};

exports.addOrUpdatePushyId = function(req, res) {
    var pushyId = req.body.pushyId;
    var authenticatedUser = req.user;

    authenticatedUser.pushyId = pushyId;
    authenticatedUser.save(function(err) {
        if (err) {
            res.status(500)
                .send({
                    'success': false,
                    'message': 'Unable to update pushyId',
                    'error': err
                });
        } else {
            res.status(200)
                .send({
                    'success': true,
                    'message': 'Updated pushyId successfully'
                });
        }
    });
};

exports.getOrAddFacebookUser = function(req, res) {
    var user;
    User
        .findOne({
            'facebook.id': req.body.fbId
        })
        .exec()
        .then(function(foundUser) {
            if (foundUser) {
                user = foundUser;
                res.status(200).send({
                    success: true,
                    message: 'User found; Access Token fetched',
                    token: authHelper.generateAccessToken({
                        'userName': user.userName,
                        'emailAddress': user.emailAddress
                    })
                });
            } else {
                user = new User();
                var generatedUserName = req.body.fbEmailAddress.split('@')[0] + Math.floor(Math.random() * 10000);
                var generatedPassword = Math.floor(Math.random() * 1000) + '' + Math.floor(Math.random() * 1000);
                var user = new User();
                user.userName = generatedUserName;
                user.emailAddress = req.body.fbEmailAddress;
                user.password = generatedPassword;
                user.fullName = req.body.fbFullName;
                user.facebook = {
                    'id': req.body.fbId,
                    'name': req.body.fbFullName,
                    'email': req.body.fbEmailAddress
                };
                user.pushyId = req.body.pushyId;
                return user.save();
            }
        })
        .then(function() {
            res.status(200)
                .send({
                    success: true,
                    message: 'User registered successfully',
                    token: authHelper.generateAccessToken({
                        'userName': user.userName,
                        'emailAddress': user.emailAddress
                    })
                });
        })
        .catch(function(error) {
            res.status(500)
                .send({
                    success: false,
                    message: 'Request failed',
                    error: error
                });
        });
};

exports.getOrAddGPlusUser = function(req, res) {
    var user;
    User
        .findOne({
            'gPlus.id': req.body.gPlusId
        })
        .exec()
        .then(function(foundUser) {
            if (foundUser) {
                user = foundUser;
                res.status(200).send({
                    success: true,
                    message: 'User found; Access Token fetched',
                    token: authHelper.generateAccessToken({
                        'userName': user.userName,
                        'emailAddress': user.emailAddress
                    })
                });
            } else {
                user = new User();
                var generatedUserName = req.body.gPlusEmailAddress.split('@')[0] + Math.floor(Math.random() * 10000);
                var generatedPassword = Math.floor(Math.random() * 1000) + '' + Math.floor(Math.random() * 1000);
                var user = new User();
                user.userName = generatedUserName;
                user.emailAddress = req.body.gPlusEmailAddress;
                user.password = generatedPassword;
                user.fullName = req.body.gPlusFullName;
                user.gPlus = {
                    'id': req.body.gPlusId,
                    'name': req.body.gPlusFullName,
                    'email': req.body.gPlusEmailAddress
                };
                user.pushyId = req.body.pushyId;
                return user.save();
            }
        })
        .then(function() {
            res.status(200)
                .send({
                    success: true,
                    message: 'User registered successfully',
                    token: authHelper.generateAccessToken({
                        'userName': user.userName,
                        'emailAddress': user.emailAddress
                    })
                });
        })
        .catch(function(error) {
            res.status(500)
                .send({
                    success: false,
                    message: 'Request failed',
                    error: error
                });
        });
};

exports.addDirectUser = function(req, res) {
    User
        .find({
            $or: [{
                userName: req.body.userName
            }, {
                emailAddress: req.body.emailAddress
            }]
        })
        .exec()
        .then(function(foundUsers) {
            if (foundUsers.length > 0) {
                throw new Error('User already exists');
            } else {
                var user = new User();
                user.userName = req.body.userName;
                user.fullName = req.body.fullName;
                user.emailAddress = req.body.emailAddress;
                user.password = req.body.password;
                user.pushyId = req.body.pushyId;
                return user.save();
            }
        })
        .then(function() {
            res.status(200)
                .send({
                    success: true,
                    message: 'User registered successfully'
                });
        })
        .catch(function(error) {
            res.status(500)
                .send({
                    success: false,
                    message: 'User registration failed',
                    error: error
                });
        });
};

exports.addFacebookUser = function(req, res) {
    User
        .find({
            'facebook.id': req.body.fbId
        })
        .exec()
        .then(function(foundUsers) {
            if (foundUsers.length > 0) {
                throw new Error('Facebook account already linked');
            } else {
                var user = new User();
                var generatedUserName = req.body.fbEmailAddress.split('@')[0] + Math.floor(Math.random() * 10000);
                var generatedPassword = Math.floor(Math.random() * 1000) + '' + Math.floor(Math.random() * 1000);
                var user = new User();
                user.userName = generatedUserName;
                user.emailAddress = req.body.fbEmailAddress;
                user.password = generatedPassword;
                user.facebook = {
                    'id': req.body.fbId,
                    'name': req.body.fbFullName,
                    'email': req.body.fbEmailAddress
                };
                user.pushyId = req.body.pushyId;
                return user.save();
            }
        })
        .then(function() {
            res.status(200)
                .send({
                    success: true,
                    message: 'User registered successfully'
                });
        })
        .catch(function(error) {
            res.status(500)
                .send({
                    success: false,
                    message: 'User registration failed',
                    error: error
                });
        });
};

exports.addGPlusUser = function(req, res) {
    User
        .find({
            'gPlus.id': req.body.gPlusId
        })
        .exec()
        .then(function(foundUsers) {
            if (foundUsers.length > 0) {
                throw new Error('Google account already linked');
            } else {
                var user = new User();
                var generatedUserName = req.body.gPlusEmailAddress.split('@')[0] + Math.floor(Math.random() * 10000);
                var generatedPassword = Math.floor(Math.random() * 1000) + '' + Math.floor(Math.random() * 1000);
                var user = new User();
                user.userName = generatedUserName;
                user.emailAddress = req.body.gPlusEmailAddress;
                user.password = generatedPassword;
                user.gPlus = {
                    'id': req.body.gPlusId,
                    'name': req.body.gPlusFullName,
                    'email': req.body.gPlusEmailAddress
                };
                user.pushyId = req.body.pushyId;
                return user.save();
            }
        })
        .then(function() {
            res.status(200)
                .send({
                    success: true,
                    message: 'User registered successfully'
                });
        })
        .catch(function(error) {
            res.status(500)
                .send({
                    success: false,
                    message: 'User registration failed',
                    error: error
                });
        });
};
