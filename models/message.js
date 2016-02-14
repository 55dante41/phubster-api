var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    'sender': {
        'username': {
            'type': String
        },
        'fullname': {
            'type': String
        },
        'pushyId': {
            'type': String
        }
    },
    'receiver': {
        'username': {
            'type': String
        },
        'fullname': {
            'type': String
        },
        'pushyId': {
            'type': String
        }
    },
    'message': {
        'type': String
    },
    'queuedOn': {
        'type': Date,
        'default': Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);
