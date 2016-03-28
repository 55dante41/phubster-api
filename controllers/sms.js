var textBelt = require('textbelt');

exports.sendVerificationCode = function(req, res) {
    var verificationCode = (Math.random() * 1000) + '' + (Math.random() * 1000);
    textbelt.send(req.body.mobileNumber, 'Your verification code is ' + verificationCode, req.body.region, function(err) {
        if (err) {
            res
                .status(500)
                .send({ message: 'Failed to send verification code. Please try again.' });
        } else {
            res
                .status(200)
                .send({ message: 'Verification code sent', code: verificationCode });
        }
    });
};
