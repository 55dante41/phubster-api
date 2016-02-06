exports.isArray = function ( variableToCheck ) {
	if ( typeof variableToCheck === 'undefined' ) {
		return false;
	}
	return variableToCheck.constructor === Array;
}
