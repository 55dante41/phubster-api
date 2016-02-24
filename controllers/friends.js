var pushyUtil = require(process.cwd() + '/util/pushy.js');
var User = require(process.cwd() + '/models/user.js');

exports.getSentInvites = function(req, res) {
    User
        .findOne({ _id: req.user._id })
        .populate('sentInvites')
        .exec()
        .then(function(foundUser) {
            res
                .status(200)
                .send({
                    success: true,
                    message: 'Fetched sent invites',
                    invites: foundUser.sentInvites
                });
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

exports.sendFriendInvite = function(req, res) {
    var recipient, sender;
    if (!req.body.friendId) {
        res
            .status(400)
            .send({
                success: true,
                message: 'Missing param: friendId'
            });
    } else {
        sender = req.user;
        User
            .findOne({ _id: req.body.friendId })
            .exec()
            .then(function(foundUser) {
                if (foundUser) {
                    recipient = foundUser;
                    var receivedInvite = {
                        _sender: req.user._id,
                        source: 'phubster'
                    };
                    recipient.receivedInvites.push(receivedInvite);
                    return recipient.save();
                } else {
                    throw new Error('Invalid User ID');
                }
            })
            .then(function() {
                var sentInvite = {
                    _recipient: recipient._id,
                    source: 'phubster'
                };
                sender.sentInvites.push(sentInvite);
                return sender.save();
            })
            .then(function() {
                res
                    .status(200)
                    .send({
                        success: true,
                        message: 'Friend invite sent successfully'
                    });
                pushyUtil.sendMessage(recipient.pushyId, {
                    messageType: 'PUSHY_MESSAGE'
                }, function(response, body) {
                    console.log('Pushy response for: ', recipient.pushyId);
                    console.log(body);
                }, function(err) {
                    console.log('Pushy error');
                    console.log(err);
                });
            })
            .catch(function(error) {
                res
                    .status(500)
                    .send({
                        success: false,
                        message: 'Something went wrong!!',
                        error: error
                    });
            });
    }
};

exports.withdrawSentFriendInvite = function(req, res) {

};

exports.acceptReceivedFriendInvite = function(req, res) {

};

exports.rejectReceivedFriendInvite = function(req, res) {

};
