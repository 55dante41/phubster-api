// Twilio Credentials 
var accountSid = 'ACc523e75f72cd4a1ebd5de356e55065d2';
var authToken = '11cf88d1d3e60c057f09b7eaa7b9cfc5';

//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken);

exports.sendVerificationCode = function(req, res) {
    if (req.user.verification && req.user.verification.status === 'verified') {
        res
            .status(400)
            .send({
                message: 'User already verified.'
            });
    } else {
        var verificationCode = (Math.random() * 1000) + '' + (Math.random() * 1000);
        req.user.verification = {
            status: 'pending_verification',
            code: verificationCode
        };
        req.user.save();
        client.messages.create({
            to: req.query.mobileNumber,
            from: "+18556309805",
            body: "Please verify with code: " + verificationCode,
        }, function(err, message) {
            if (err) {
                res
                    .status(400)
                    .send({
                        message: 'Request failed. Please try again.'
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
