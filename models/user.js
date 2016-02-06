// Load required packages
var mongoose = require( 'mongoose' );
var bcrypt = require( 'bcrypt-nodejs' );
var ObjectId = mongoose.Schema.Types.ObjectId;

// Define our user schema
var UserSchema = new mongoose.Schema( {
	username: {
		type: String,
		unique: true

	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	gPlus: {
		id: {
			type: String
		},
		email: {
			type: String
		},
		name: {
			type: String
		}
	},
	password: {
		type: String,
		required: true
	},
	ransomly_token: {
		type: String,
		unique: true,
		"default": " "
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	fullname: {
		type: String
	},
	profile_pic: {
		type: String,
	}, //this would be an amazon s3 url
	source: {
		type: String,
	},
	gcmid: {
		type: String,
		"default": " "
	},
	pushyId: {
		type: String
	},
	friends: {
		type: Array,
		unique: true,
		"default": [ ]
	}, //friends that can block stuff, authority used for one way blocking (parents)
	friend_requests: {
		type: Array,
		"default": [ ] //friend request {username: zprager, email:zprager@gmail.com, accepted: false, accepted: date}
	},
	friend_requested: {
		type: Array,
		"default": [ ] //friend requested {username: zprager, email:zprager@gmail.com, accepted: false, accepted: date}
	},
	currently_blocked: //list of currently blocked apps
	{
		type: Array
	},
	// [{ package_name: String,blocker_username: String,start_time: String,stop_time: String,request_text: String,image: String  }
	// ],
	user_blocked_these_apps: //list of apps blocked by the user
	{
		type: Array
	},
	currently_blocked_urls: //list of currently blocked urls
	{
		type: Array
	},
	// [       { package_name: String, url_friendly_name: String,blocker_username: String,start_time: String,stop_time: String,request_text: String,image: String
	//         }
	// ],
	web_notifications: //array element {blocker_username: String, blockee_username: String, request_text: String}
	//used to request releases of blocked URLs
	{
		type: Array
	},
	user_blocked_these_urls: //list of of urls blocked by the user
	{
		type: Array
	},
	//[{package_name: String}]
	available_apps: {
		type: Array
	},
	// { blocker_username: String, blockee_username: String }
	block_release_requests: {
		type: Array
	},
	stripeCustomer: {

	},
	subscription: {
		name: {
			type: String
		},
		price: {
			type: Number
		},
		currency: {
			type: String
		},
		subscribedOn: {
			type: Date
		},
		validUntil: {
			type: Date
		},
		isActive: {
			type: Boolean
		},
		description: {
			type: String
		},
		allowedValues: {
			type: Number
		},
		usedValues: {
			type: Number
		}
	}
} );

// Execute before each user.save() call
UserSchema.pre( 'save', function ( callback ) {
	var user = this;

	// Break out if the password hasn't changed
	if ( !user.isModified( 'password' ) ) return callback( );

	// Password changed so we need to hash it
	bcrypt.genSalt( 5, function ( err, salt ) {
		if ( err ) return callback( err );

		bcrypt.hash( user.password, salt, null, function ( err, hash ) {
			if ( err ) return callback( err );
			user.password = hash;
			callback( );
		} );
	} );
} );

///method to verify password using bcrypt
UserSchema.methods.verifyPassword = function ( password, cb ) {
	bcrypt.compare( password, this.password, function ( err, isMatch ) {
		if ( err ) return cb( err );
		cb( null, isMatch );
	} );
};

// Export the Mongoose model
module.exports = mongoose.model( 'User', UserSchema );
