'use strict';
/*jshint node:true*/

require('dotenv').load();

var Firebase = require('firebase');
var logger = require('tracer').colorConsole();
var firebase = new Firebase(process.env.FB_URL);

function callback (error, authData) {
	if (error) {
		logger.error(error);
	} else {
		logger.log(authData);
	}
}

// Authenticate
firebase.authWithCustomToken(process.env.FIREBASE_AUTH_TOKEN, callback)

module.exports = firebase;
