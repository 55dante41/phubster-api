var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pushyId: {
        type: String,
        required: true
    },
    facebook: {
        id: {
            type: String
        },
        emailAddress: {
            type: String
        },
        name: {
            type: String
        }
    },
    gPlus: {
        id: {
            type: String
        },
        emailAddress: {
            type: String
        },
        name: {
            type: String
        }
    },
    friends: [{
        friend: {
            type: String,
            ref: 'User'
        },
        source: {
            type: String
        }
    }],
    sentInvites: [{
        recipient: {
            type: String,
            ref: 'User'
        },
        source: {
            type: String
        }
    }],
    receivedInvites: [{
        sender: {
            type: String,
            ref: 'User'
        },
        source: {
            type: String
        }
    }]
});

userSchema.pre('save', function(callback) {
    var user = this;

    if (!user.isModified('password')) {
        callback(null);
    } else {
        bcrypt.genSalt(5, function(err, salt) {
            if (err) {
                callback(err);
            } else {
                bcrypt.hash(user.password, salt, null, function(err, hash) {
                    if (err) return callback(err);
                    user.password = hash;
                    callback();
                });
            }
        });
    }
});

userSchema.methods.verifyPassword = function(password, cb) {
    var user = this;

    bcrypt.compare(password, user.password, function(err, isMatch) {
        if (err) {
            cb(err);
        } else {
            cb(null, isMatch);
        }
    });
};

module.exports = mongoose.model('User', userSchema);
