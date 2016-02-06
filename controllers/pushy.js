var request = require( 'request' );

var User = require( process.cwd( ) + '/models/user.js' );

var pushyApiKey = '089688106580343044581979359ddbc7f8a996cb84c5dc9653a0f65bc7195908';

exports.testPushy = function ( req, res ) {
	var testDeviceRegistrationId = req.body.testDeviceRegistrationId;
	var registrationIdsToSend = [ ];
	registrationIdsToSend.push( testDeviceRegistrationId );
	sendMessage( registrationIdsToSend, {
		'updateType': 2,
		'notificationMessage': 'Pushy notification is working!'
	}, function ( response, body ) {
		res.send( {
			'success': true,
			'message': 'Push notification queued successfully',
			'data': {
				'response': response,
				'body': body
			}
		} );
	}, function ( err ) {
		res.send( {
			'success': false,
			'message': err.message,
			'data': {
				'error': err.error
			}
		} );
	} );
};

exports.sendPushyMessage = function ( userName, messageData, successCb, errorCb ) {
	User.findOne( {
		'username': userName
	}, function ( err, foundUser ) {
		if ( err ) {
			errorCb( {
				'error': err,
				'message': 'Database error'
			} );
		} else {
			if ( foundUser ) {
				sendMessage( registrationIdsToSend, messageData, successCb, errorCb );
			} else {
				errorCb( {
					'error': {},
					'message': 'User not found'
				} )
			}
		}
	} )

};

var sendMessage = function ( registrationIds, data, successCb, errorCb ) {
	console.log( 'pushy regIds', registrationIds );
	console.log( 'pushy data', data );
	request.post( {
		'url': 'https://pushy.me/push?api_key=' + pushyApiKey,
		'json': true,
		'body': {
			'registration_ids': registrationIds,
			'data': data
		}
	}, function ( err, httpResponse, body ) {
		if ( err ) {
			errorCb( {
				'error': err,
				'message': 'Pushy API error'
			} );
		} else {
			successCb( httpResponse, body );
		}
	} );
};
