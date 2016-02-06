var validateRequest = function ( req, rules ) {
	var requiredBodyParams = rules.body;
	var requiredQueryParams = rules.query;

	var returnJSON = {};
	var isValid = true;
	var returnMessage = '';

	var areBodyParamsValid;
	var areQueryParamsValid;

	if ( typeof requiredQueryParams == 'undefined' || requiredQueryParams.length == 0 ) {
		areQueryParamsValid = true;
	} else {
		var requiredQueryParamsTruthArray = [ ];
		for ( var i = 0; i < requiredQueryParams.length; i++ ) {
			if ( requiredQueryParams[ i ].length == 0 ) {
				requiredQueryParamsTruthArray[ i ] = true;
			} else {
				var atleastOneQueryParamRequiredTruthArray = [ ];
				for ( var j = 0; j < requiredQueryParams[ i ].length; j++ ) {
					atleastOneQueryParamRequiredTruthArray[ j ] = typeof req.query[ requiredQueryParams[ i ][ j ] ] != 'undefined';
				}
				requiredQueryParamsTruthArray[ i ] = atleastOneQueryParamRequiredTruthArray.indexOf( true ) != -1;
			}
		}
		var failedQueryParamsIndex = requiredQueryParamsTruthArray.indexOf( false );
		areQueryParamsValid = failedQueryParamsIndex == -1;
		if ( areQueryParamsValid == false ) {
			returnMessage += 'Required atleast one of query params: ';
			for ( var i = 0; i < requiredQueryParams[ failedQueryParamsIndex ].length; i++ ) {
				if ( i == 0 ) {
					returnMessage = returnMessage + requiredQueryParams[ failedQueryParamsIndex ][ i ];
				} else {
					returnMessage = returnMessage + ', ' + requiredQueryParams[ failedQueryParamsIndex ][ i ];
				}
			}
		}
	}

	if ( areQueryParamsValid ) {
		if ( typeof requiredBodyParams == 'undefined' || requiredBodyParams.length == 0 ) {
			areBodyParamsValid = true;
		} else {
			var requiredBodyParamsTruthArray = [ ];
			for ( var i = 0; i < requiredBodyParams.length; i++ ) {
				if ( requiredBodyParams[ i ].length == 0 ) {
					requiredBodyParamsTruthArray[ i ] = true;
				} else {
					var atleastOneBodyParamRequiredTruthArray = [ ];
					for ( var j = 0; j < requiredBodyParams[ i ].length; j++ ) {
						atleastOneBodyParamRequiredTruthArray[ j ] = typeof req.body[ requiredBodyParams[ i ][ j ] ] != 'undefined';
					}
					requiredBodyParamsTruthArray[ i ] = atleastOneBodyParamRequiredTruthArray.indexOf( true ) != -1;
				}
			}
			var failedBodyParamsIndex = requiredBodyParamsTruthArray.indexOf( false );
			areBodyParamsValid = failedBodyParamsIndex == -1;
			if ( areBodyParamsValid == false ) {
				returnMessage += 'Required atleast one of body params: ';
				for ( var i = 0; i < requiredBodyParams[ failedBodyParamsIndex ].length; i++ ) {
					if ( i == 0 ) {
						returnMessage = returnMessage + requiredBodyParams[ failedBodyParamsIndex ][ i ];
					} else {
						returnMessage = returnMessage + ', ' + requiredBodyParams[ failedBodyParamsIndex ][ i ];
					}
				}
			}
		}
	}

	isValid = areQueryParamsValid && areBodyParamsValid;

	returnJSON.isValid = isValid;
	returnJSON.message = returnMessage;

	return returnJSON;
};

exports.validateRequestAndRespondIfInvalid = function ( req, res, rules ) {
	var validationResponse = validateRequest( req, rules );
	if ( validationResponse.isValid == false ) {
		res.status( 400 )
			.send( {
				success: false,
				message: validationResponse.message
			} );
		return true;
	}
	return false;
};
