var User = require(process.cwd() + '/models/user.js');
var authHelper = require(process.cwd() + '/helpers/auth.js');
var Joi = require('joi');

exports.getUser = function(req, res) {
    User
        .findOne({ _id: req.user._id })
        .populate('sentInvites._recipient', 'userName emailAddress fullName')
        .populate('receivedInvites._sender', 'userName emailAddress fullName')
        .populate('friends._friend', 'userName emailAddress fullName')
        .select('-password')
        .exec()
        .then(function(foundUser) {
            if (!foundUser) {
                throw new Error('User not found.');
            } else {
                res
                    .status(200)
                    .send({
                        success: true,
                        message: 'Authentication successful; User found',
                        user: foundUser
                    });
            }
        })
        .catch(function(error) {
            res
                .status(500)
                .send({
                    success: false,
                    message: 'Something went wrong, please try again.',
                    error: error
                });
        });
};

exports.findUsers = function(req, res) {
    if (!req.query.searchValue) {
        res
            .status(400)
            .send({
                'success': false,
                'message': 'Please specify the search value and try again!!'
            });
    } else {
        User
            .find({
                $or: [{
                    userName: req.query.searchValue
                }, {
                    emailAddress: req.query.searchValue
                }, {
                    fullName: req.query.searchValue
                }]
            })
            .select('userName emailAddress fullName')
            .exec()
            .then(function(searchResults) {
                res
                    .status(200)
                    .send({
                        'success': true,
                        'message': 'Fetched query results.',
                        'results': searchResults
                    });
            })
            .catch(function(error) {
                res
                    .status(500)
                    .send({
                        'success': false,
                        'message': 'Something went wrong, please try again.',
                        'error': error
                    });
            });
    }
};

exports.addOrUpdatePushyId = function(req, res) {
    var pushyId = req.body.pushyId;
    var authenticatedUser = req.user;

    authenticatedUser.pushyId = pushyId;
    authenticatedUser.save(function(err) {
        if (err) {
            res
                .status(500)
                .send({
                    'success': false,
                    'message': 'Unable to update pushyId',
                    'error': err
                });
        } else {
            res
                .status(200)
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
                console.log('User found');
                user = foundUser;
                var error = new Error();
                error.handlerType = 'USER_FOUND::SEND_ACCESS_TOKEN';
                throw error;
            } else {
                console.log('User not found, creating a new one...')
                user = new User();
                var generatedUserName = req.body.fbEmailAddress.split('@')[0] + Math.floor(Math.random() * 10000);
                var generatedPassword = Math.floor(Math.random() * 1000) + '' + Math.floor(Math.random() * 1000);
                user.userName = generatedUserName;
                user.emailAddress = req.body.fbEmailAddress;
                user.password = generatedPassword;
                user.fullName = req.body.fbFullName;
                user.facebook = {
                    'id': req.body.fbId,
                    'name': req.body.fbFullName,
                    'emailAddress': req.body.fbEmailAddress
                };
                user.pushyId = req.body.pushyId;
                return user.save();
            }
        })
        .then(function() {
            console.log('Promise then called');
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
            console.log(error);
            if (error.handlerType === 'USER_FOUND::SEND_ACCESS_TOKEN') {
                res.status(200).send({
                    success: true,
                    message: 'User found; Access Token fetched',
                    token: authHelper.generateAccessToken({
                        'userName': user.userName,
                        'emailAddress': user.emailAddress
                    })
                });
            } else {
                res.status(500)
                    .send({
                        success: false,
                        message: 'Request failed',
                        error: error
                    });
            }
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
                user.userName = generatedUserName;
                user.emailAddress = req.body.gPlusEmailAddress;
                user.password = generatedPassword;
                user.fullName = req.body.gPlusFullName;
                user.gPlus = {
                    'id': req.body.gPlusId,
                    'name': req.body.gPlusFullName,
                    'emailAddress': req.body.gPlusEmailAddress
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
    if (!req.body.userName || !req.body.emailAddress || !req.body.password) {
        res
            .status(400)
            .send({
                success: false,
                message: 'Missing one of required params: userName, emailAddress, password'
            });
    } else {
        var newUser;
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
                    newUser = new User();
                    newUser.userName = req.body.userName;
                    newUser.fullName = req.body.fullName;
                    newUser.emailAddress = req.body.emailAddress;
                    newUser.password = req.body.password;
                    newUser.pushyId = req.body.pushyId;
                    return newUser.save();
                }
            })
            .then(function() {
                res
                    .status(200)
                    .send({
                        success: true,
                        message: 'User registered successfully',
                        token: authHelper.generateAccessToken({
                            'userName': newUser.userName,
                            'emailAddress': newUser.emailAddress
                        })
                    });
            })
            .catch(function(error) {
                console.log(error);
                res
                    .status(500)
                    .send({
                        success: false,
                        message: 'User registration failed',
                        error: error
                    });
            });
    }
};
