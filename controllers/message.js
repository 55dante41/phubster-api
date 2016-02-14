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
                'username': receiverUserName
            };
        } else if (receiverEmail) {
            query = {
                'email': receiverEmail
            };
        }
        User
            .findOne(query)
            .exec()
            .then(function(foundUser) {
                pushyUtil.sendMessage(foundUser.pushyId, {
                    'message': message,
                    'sender': {
                        'userName': sender.username,
                        'email': sender.email,
                        'fullName': sender.fullname
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
                    'username': sender.username,
                    'pushyId': sender.pushyId,
                    'fullname': sender.fullname,
                    'email': sender.email
                };
                messageToSave.receiver = {
                    'username': foundUser.username,
                    'pushyId': foundUser.pushyId,
                    'fullname': foundUser.fullname,
                    'email': foundUser.email
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
