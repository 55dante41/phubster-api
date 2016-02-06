var messageController = require( process.cwd( ) + '/controllers/message.js' );
var userController = require( process.cwd( ) + '/controllers/user.js' );
var pushyController = require( process.cwd( ) + '/controllers/pushy.js' );
var authController = require( process.cwd( ) + '/controllers/auth.js' );

exports.init = function ( router ) {
	router.route( '/api/users/authenticate' )
		.post( authController.getAuthenticationToken );
	router.route( '/api/messages/send' )
		.post( authController.isTokenAuthenticated, messageController.sendMessage );
	router.route( '/api/users/update/pushyId' )
		.post( authController.isTokenAuthenticated, userController.addOrUpdatePushyId );
};
