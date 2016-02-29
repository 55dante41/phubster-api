var pushyUtil = require(process.cwd() + '/util/pushy.js');
var User = require(process.cwd() + '/models/user.js');

exports.getSentInvites = function(req, res) {
    User
        .findOne({ _id: req.user._id })
        .populate('sentInvites._recipient', 'userName emailAddress fullName')
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

exports.getReceivedInvites = function(req, res) {
    User
        .findOne({ _id: req.user._id })
        .populate('receivedInvites._sender', 'userName emailAddress fullName')
        .exec()
        .then(function(foundUser) {
            res
                .status(200)
                .send({
                    success: true,
                    message: 'Fetched received invites',
                    invites: foundUser.receivedInvites
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
                success: false,
                message: 'Missing param: friendId'
            });
    } else {
        sender = req.user;
        if (sender.friends.filter(function(e) {
                return e._friend == req.body.friendId
            }).length > 0) {
            res
                .status(400)
                .send({
                    success: false,
                    message: 'Requested user is already a friend'
                });
            return;
        }
        if (sender.sentInvites.filter(function(e) {
                return e._recipient == req.body.friendId
            }).length > 0) {
            res
                .status(400)
                .send({
                    success: false,
                    message: 'Already sent a friend request'
                });
            return;
        }
        if (sender.receivedInvites.filter(function(e) {
                return e._sender == req.body.friendId
            }).length > 0) {
            res
                .status(400)
                .send({
                    success: false,
                    message: 'Already received a friend request'
                });
            return;
        }
        if (sender._id.toString() == req.body.friendId) {
            res
                .status(400)
                .send({
                    success: false,
                    message: 'You cannot send a request to yourself'
                });
            return;
        }

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
    if (!req.body.friendId) {
        res
            .status(400)
            .send({
                success: true,
                message: 'Missing param: friendId'
            });
    } else {
        var recipient, sender;
        var recipientReceivedInviteIndex, senderSentInviteIndex;

        recipient = req.user;
        User.findOne({ _id: req.body.friendId })
            .exec()
            .then(function(foundUser) {
                sender = foundUser;
                if (sender._id.equals(recipient._id)) {
                    throw new Error('Invalid request, the sender and recipient are the same user.');
                }
                for (var i = 0; i < recipient.receivedInvites.length; i++) {
                    if (recipient.receivedInvites[i]._sender.equals(sender._id)) {
                        recipientReceivedInviteIndex = i;
                        var recipientAcceptedFriend = {
                            _friend: recipient.receivedInvites[i]._sender,
                            source: recipient.receivedInvites[i].source
                        };
                        recipient.friends.push(recipientAcceptedFriend);
                        break;
                    }
                }

                if (recipientReceivedInviteIndex > -1) {
                    recipient.receivedInvites.splice(recipientReceivedInviteIndex, 1);
                }
                return recipient.save();
            })
            .then(function() {
                for (var i = 0; i < sender.sentInvites.length; i++) {
                    if (sender.sentInvites[i]._recipient.equals(recipient._id)) {
                        senderSentInviteIndex = i;
                        var senderAcceptedFriend = {
                            _friend: sender.sentInvites[i]._recipient,
                            source: sender.sentInvites[i].source
                        };
                        sender.friends.push(senderAcceptedFriend);
                        break;
                    }
                }

                if (senderSentInviteIndex > -1) {
                    sender.sentInvites.splice(senderSentInviteIndex, 1);
                }
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
                pushyUtil.sendMessage(sender.pushyId, {
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
                console.log(error);
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

exports.rejectReceivedFriendInvite = function(req, res) {

};
