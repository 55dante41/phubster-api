var pushyUtil = require(process.cwd() + '/util/pushy.js');
// Twilio Credentials 
var accountSid = 'ACc523e75f72cd4a1ebd5de356e55065d2';
var authToken = '11cf88d1d3e60c057f09b7eaa7b9cfc5';

//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken);

exports.sendInvites = function(req, res) {
    var mobileNumbers = req.body.mobileNumbers;
    var fullName = req.body.fullName;
    var message = req.body.message;

    if (mobileNumbers && mobileNumbers.length > 0) {
        if (!message) {
            message = "This is " + fullName + " via Andale chat. Please install this app to chat with me.";
        }
        mobileNumbers.forEach(function(mobileNumber) {
            client.messages.create({
                to: mobileNumber,
                from: "+18556309805",
                body: message,
            })
        });
        res
            .status(200)
            .send({
                'message': 'Invites queued.'
            });
    } else {
        res
            .status(400)
            .send({
                'message': 'No numbers selected.'
            });
    }
};

exports.sendVerificationCode = function(req, res) {
    if (req.user.verification && req.user.verification.status === 'verified') {
        res
            .status(400)
            .send({
                message: 'User already verified.'
            });
    } else {
        var verificationCode = Math.ceil(Math.random() * 1000) + '' + Math.ceil(Math.random() * 1000);
        req.user.verification = {
            status: 'pending_verification',
            code: verificationCode
        };
        req.user.save();
        var message = "Please verify with code: " + verificationCode;
        console.log(req.query.mobileNumber);
        console.log(message);
        client.messages.create({
            to: req.query.mobileNumber,
            from: "+18556309805",
            body: message,
        }, function(err, message) {
            if (err) {
                res
                    .status(400)
                    .send({
                        message: 'Request failed. Please try again.',
                        error: err
                    });
            } else {
                console.log(message.sid);
                res
                    .status(200)
                    .send({
                        message: 'Sent verification code to the requested number.'
                    });
            }
        });
    }

};

exports.verifyWithVerificationCode = function(req, res) {
    if (req.user.verification) {
        if (req.user.verification.code == req.body.verificationCode) {
            req.user.verification.status = 'verified';
            req.user.save(function(err) {
                if (err) {
                    res
                        .status(500)
                        .send({
                            message: 'Something went wrong. Please try again.'
                        });
                } else {
                    pushyUtil.sendMessage(req.user.pushyId, {
                        messageType: 'PUSHY_MESSAGE'
                    }, function(response, body) {
                        console.log('Pushy response for: ', req.user.pushyId);
                        console.log(body);
                    }, function(err) {
                        console.log('Pushy error');
                        console.log(err);
                    });
                    res
                        .status(200)
                        .send({
                            message: 'Verification successful.'
                        });
                }
            })
        } else {
            res
                .status(403)
                .send({
                    message: 'Invalid code. Please try again.'
                });
        }
    } else {
        res
            .status(400)
            .send({
                message: 'Cannot verify. Please re-initiate verification.'
            });
    }
};
