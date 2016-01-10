'use strict';

var ElasticClient = require('elasticsearchclient')
var db = require('../database');

// initialize our ElasticSearch API
var client = new ElasticClient({
	host: process.env.ELASTICSEARCH_HOST,
	port: process.env.ELASTICSEARCH_PORT
});

// listen for changes to Firebase data
// var fb = new Firebase('<INSTANCE>.firebaseio.com/widgets');

var fb = db.childRef('catalog');

fb.on('child_added',   createOrUpdateIndex);
fb.on('child_changed', createOrUpdateIndex);
fb.on('child_removed', removeIndex);

function createOrUpdateIndex(snap) {
	 client.index(this.index, this.type, snap.val(), snap.key())
		 .on('data', function(data) { console.log('indexed ', snap.key()); })
		 .on('error', function(err) { /* handle errors */ });
}

function removeIndex(snap) {
	 client.deleteDocument(this.index, this.type, snap.key(), function(error, data) {
			if( error ) console.error('failed to delete', snap.key(), error);
			else console.log('deleted', snap.key());
	 });
}
