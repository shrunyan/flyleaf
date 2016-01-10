'use strict';

require('dotenv').load();

// var Firebase = require('firebase');
var ElasticSearchClient = require('elasticsearchclient');
var logger = require('tracer').colorConsole();
var db = require('../api/database');

// initialize our ElasticSearch API
var esc = new ElasticSearchClient({
	host: process.env.ELASTICSEARCH_HOST,
	port: process.env.ELASTICSEARCH_PORT
});

// logger.log(esc.index);

// // listen for changes to Firebase data
// // var fb = new Firebase(`${process.env.FB_URL}/catalog`);
var fb = db.child('catalog');
fb.on('child_added', createOrUpdateIndex);
fb.on('child_changed', createOrUpdateIndex);
fb.on('child_removed', removeIndex);

function createOrUpdateIndex(snap) {
	esc.index({
		index: 'books',
		type: 'book',
		id: snap.key(),
		body: snap.val()
	}, (error, response) => {
		if (error) {
			logger.error(error);
		} else {
			logger.debug(response);
		}
	})

	// esc.index(this.index, this.type, snap.val(), snap.key())
	// 	.on('data', data => {
	// 		logger.debug('indexed ', snap.key());
	// 	})
	// 	.on('error', error => {
	// 		logger.error(error)
	// 	});
}

function removeIndex(snap) {
	 esc.deleteDocument(this.index, this.type, snap.key(), (error, data) => {
			if (error) {
				logger.error('failed to delete', snap.key(), error);
			} else {
				logger.debug('deleted', snap.key());
			}
	 });
}
