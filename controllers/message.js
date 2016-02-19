var requestValidatorUtil = require(process.cwd() + '/util/requestValidator.js');
var pushyUtil = require(process.cwd() + '/util/pushy.js');
var User = require(process.cwd() + '/models/user.js');
var Message = require(process.cwd() + '/models/message.js');

exports.sendMessage = function(req, res) {
    if (!requestValidatorUtil.validateRequestAndRespondIfInvalid(req, res, {
            'body': [
                ['message'],
                ['userName', 'email']
            ]
        })) {
        var message = req.body.message;
        var receiverUserName = req.body.userName;
        var receiverEmail = req.body.email;

        var sender = req.user;

        var query;
        if (receiverUserName) {
            query = {
                'userName': receiverUserName
            };
        } else if (receiverEmail) {
            query = {
                'emailAddress': receiverEmail
            };
        }
        User
            .findOne(query)
            .exec()
            .then(function(foundUser) {
                pushyUtil.sendMessage(foundUser.pushyId, {
                    'message': message,
                    'sender': {
                        'userName': sender.userName,
                        'emailAddress': sender.emailAddress,
                        'fullName': sender.fullName
                    },
                    'blockApps': true
                }, function(response, body) {
                    console.log('Pushy response for: ', foundUser.pushyId);
                    console.log(body);
                    res.status(200)
                        .send({
                            'success': true,
                            'message': 'Message queued successfully'
                        });
                }, function(err) {
                    console.log('Pushy error');
                    console.log(err);
                    res.status(500)
                        .send({
                            'success': false,
                            'message': 'Message queueing failed',
                            'error': err
                        });
                });
                var messageToSave = new Message();
                messageToSave.sender = {
                    'userName': sender.userName,
                    'pushyId': sender.pushyId,
                    'fullName': sender.fullName,
                    'emailAddress': sender.emailAddress
                };
                messageToSave.receiver = {
                    'userName': foundUser.userName,
                    'pushyId': foundUser.pushyId,
                    'fullName': foundUser.fullName,
                    'emailAddress': foundUser.emailAddress
                };
                messageToSave.message = message;
                messageToSave.save(function(err) {
                    if (err) {
                        console.log('Database error');
                        console.log(err);
                    }
                });
            })
            .catch(function(error) {
                console.log('Database error');
                console.log(error);
                res.status(500)
                    .send({
                        'success': false,
                        'message': 'Message queueing failed',
                        'error': error
                    });
            });
    }
};
