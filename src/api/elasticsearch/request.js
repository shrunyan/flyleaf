'use strict';

require('dotenv').load();

const SEARCH_REQUEST = 'search/request';
const SEARCH_RESPONSE = 'search/response';

var Firebase = require('firebase');
var ElasticClient = require('elasticsearchclient');
var logger = require('tracer').colorConsole();

// initialize our ElasticSearch API
var client = new ElasticClient({
	host: process.env.ELASTICSEARCH_HOST,
	port: process.env.ELASTICSEARCH_PORT
});

// listen for requests at https://<INSTANCE>.firebaseio.com/search/request
var queue = new Firebase(process.env.FB_URL);
queue.child(SEARCH_REQUEST).on('child_added', processRequest);

function processRequest(snap) {
   snap.ref().remove(); // clear the request after we receive it
   var data = snap.val();
   // Query ElasticSearch
   client.search(dat.index, dat.type, {
   	"query": {
   		'query_string': {
   			query: dat.query
   		}
   	})
   .on('data', function(data) {
       // Post the results to https://<INSTANCE>.firebaseio.com/search/response
       queue.child(`${SEARCH_RESPONSE}/${snap.key()}`).set(results);
   })
   .on('error', error => logger.error(error))
   .exec();
}
