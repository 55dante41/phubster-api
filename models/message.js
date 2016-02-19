var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    'sender': {
        'userName': {
            'type': String
        },
        'fullName': {
            'type': String
        },
        'pushyId': {
            'type': String
        }
    },
    'receiver': {
        'userName': {
            'type': String
        },
        'fullName': {
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
