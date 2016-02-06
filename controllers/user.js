var User = require( process.cwd( ) + '/models/user.js' );
var requestValidatorUtil = require( process.cwd( ) + '/util/requestValidator.js' );

exports.addOrUpdatePushyId = function ( req, res ) {
	if ( !requestValidatorUtil.validateRequestAndRespondIfInvalid( req, res, {
			body: [
				[ 'pushyId' ]
			]
		} ) ) {
		var pushyId = req.body.pushyId;
		var authenticatedUser = req.user;

		authenticatedUser.pushyId = pushyId;
		authenticatedUser.save( function ( err ) {
			if ( err ) {
				res.status( 500 )
					.send( {
						'success': false,
						'message': 'Unable to update pushyId',
						'error': err
					} );
			} else {
				res.status( 200 )
					.send( {
						'success': true,
						'message': 'Updated pushyId successfully'
					} );
			}
		} );
	}
}
