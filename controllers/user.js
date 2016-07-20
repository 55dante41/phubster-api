var Joi = require('joi');

var User = requireModel('user');
var authHelper = requireHelper('auth');

var UserNotFoundError = requireError('UserNotFoundError');
var UserAlreadyExistsError = requireError('UserAlreadyExistsError');

exports.getUser = function(req, res) {
    console.log(JSON.stringify(req.user));
    User
        .findOne({ userName: req.user.userName })
        .populate('sentInvites._recipient', 'userName emailAddress fullName')
        .populate('receivedInvites._sender', 'userName emailAddress fullName')
        .populate('friends._friend', 'userName emailAddress fullName')
        .select('-password')
        .exec()
        .then(function(foundUser) {
            if (!foundUser) {
                throw new UserNotFoundError();
            } else {
                console.log('.............');
                console.log(JSON.stringify(foundUser));
                console.log('.............');

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
            handleErrorResponse(error, res);
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
        var userRegex = new RegExp(req.query.searchValue, 'i');
        User
            .find({
                $or: [{
                    userName: userRegex
                }, {
                    emailAddress: userRegex
                }, {
                    fullName: userRegex
                }, {
                    mobileNumber: userRegex
                }]
            })
            .select('userName emailAddress fullName mobileNumber')
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
                handleErrorResponse(error, res);
            });
    }
};

exports.areAlreadyUsers = function(req, res) {
    var mobileNumbers = req.body.mobileNumbers;

    mobileNumbers = mobileNumbers.split('[').join('');
    mobileNumbers = mobileNumbers.split(']').join('');
    mobileNumbers = mobileNumbers.split(',');

    var isAUserMapping = {};
    mobileNumbers.forEach(function(mobileNumber) {
        isAUserMapping[mobileNumber] = false;
    });

    User
        .find({
            mobileNumber: {
                $in: mobileNumbers
            }
        })
        .exec()
        .then(function(foundUsers) {
            foundUsers.forEach(function(foundUser) {
                isAUserMapping[foundUser.mobileNumber] = true;
            });
            res
                .status(200)
                .send(isAUserMapping);
        })
        .catch(function(error) {
            handleErrorResponse(error, res);
        })
};

exports.addOrUpdatePushyId = function(req, res) {
    var pushyId = req.body.pushyId;
    var authenticatedUser = req.user;

    authenticatedUser.pushyId = pushyId;
    console.log('-------------');
    console.log(pushyId);
    console.log('-------------');

    authenticatedUser
        .save()
        .then(function() {
            res
                .status(200)
                .send({
                    'success': true,
                    'message': 'Updated pushyId successfully'
                });
        })
        .catch(function(error) {
            handleErrorResponse(error, res);
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
                    throw new UserAlreadyExistsError();
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
                handleErrorResponse(error, res);
            });
    }
};

exports.getOrAddFacebookAccountKitUser = function(req, res) {
    var mobileNumber, emailAddress, accountId;
    var hasMobileNumber = false,
        hasEmailAddress = false;
    var user;
    if (req.body.mobileNumber) {
        mobileNumber = req.body.mobileNumber;
        hasMobileNumber = true;
    }
    if (req.body.emailAddress) {
        emailAddress = req.body.emailAddress;
        hasEmailAddress = true;
    }
    if (req.body.accountId) {
        accountId = req.body.accountId;
    }
    console.log('++++++++++++++++');
    console.log(mobileNumber);
    console.log(emailAddress);
    console.log(accountId);
    console.log('++++++++++++++++');
    if (!hasEmailAddress && !hasMobileNumber) {
        res
            .status(400)
            .send();
    } else {
        var findQuery = {};
        if (hasMobileNumber) {
            findQuery.mobileNumber = mobileNumber;
        }
        if (hasEmailAddress) {
            findQuery.emailAddress = emailAddress;
        }
        console.log('++++++++++++++++');
        console.log(JSON.stringify(findQuery));
        console.log('++++++++++++++++');
        User
            .findOne(findQuery)
            .exec()
            .then(function(foundUser) {
                if (foundUser) {
                    user = foundUser;
                    user.verification = {
                        status: 'verified',
                        code: '000000'
                    };
                    user.mobileNumber = mobileNumber;
                    user.emailAddress = emailAddress;
                    user.facebook_ak = {
                        id: accountId,
                        emailAddress: emailAddress,
                        mobileNumber: mobileNumber
                    };
                    if (req.body.pushyId) {
                        user.pushyId = req.body.pushyId;
                    }
                    return user.save();
                } else {
                    user = new User();
                    if (hasMobileNumber) {
                        user.userName = 'ak_user_' + mobileNumber;
                    } else if (hasEmailAddress) {
                        user.userName = 'ak_user_' + emailAddress.split('@')[0];
                    }
                    user.mobileNumber = mobileNumber;
                    user.emailAddress = emailAddress;
                    user.verification = {
                        status: 'verified',
                        code: '000000'
                    };
                    user.source = 'facebook_account_kit';
                    user.facebook_ak = {
                        id: accountId,
                        emailAddress: emailAddress,
                        mobileNumber: mobileNumber
                    };
                    user.pushyId = req.body.pushyId;
                    return user.save();
                }
            })
            .then(function() {
                console.log(',,,,,,,');
                console.log(JSON.stringify(user));
                console.log(',,,,,,,');
                
                res
                    .status(200)
                    .send({
                        success: true,
                        message: 'User registered successfully',
                        token: authHelper.generateAccessToken({
                            'userName': user.userName,
                            'emailAddress': user.emailAddress,
                            'mobileNumber': user.mobileNumber
                        })
                    });
            })
            .catch(function(error) {
                handleErrorResponse(error, res);
            });
    }
};
