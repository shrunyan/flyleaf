'use strict';

var logger = require('tracer').colorConsole();
var db = require('../database');
var mangaeden = db.child('sources').child('mangaeden');

module.exports = (req, res) => {
	// TODO find term
	// check against
	// - titles
	// - genres

	const TERM = decodeURI(req.params.term);

	logger.debug(TERM);

	mangaeden.orderByChild('title').startAt(TERM).endAt(TERM).on('child_added', (snapshot) => {
		if (snapshot.exists()) {
			logger.debug(snapshot.val())
		}
	})

}
