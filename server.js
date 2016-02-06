var express = require( 'express' ),
	mongoose = require( 'mongoose' ),
	bodyParser = require( 'body-parser' ),
	cors = require( 'cors' ),
	cookieParser = require( 'cookie-parser' ),
	routes = require( process.cwd( ) + '/routes.js' ),
	dbConfig = require( process.cwd( ) + '/config/database.js' ),
	envConfig = require( process.cwd( ) + '/config/environment.js' );

mongoose.connect( dbConfig.mongoConnectionString, function ( err, res ) {
	if ( err ) {
		console.log( 'Error connecting to MongoDB (MongoLab)' );
		console.log( err );
	} else {
		console.log( 'Successfully established connection with MongoLab' );
	}
} );

var app = express( );

app.use( bodyParser.urlencoded( {
	extended: true
} ) );
app.use( bodyParser.json( ) );
app.use( cookieParser( ) );
app.use( cors( ) );

var router = express.Router( );
routes.init( router );
app.use( '/', router );

app.listen( envConfig.port );
console.log( 'Server started and listening on port: ' + envConfig.port );
