'use strict';

/**
 * This worker listens for queued search requests.
 * It responds by performing a search on the
 * Elasticsearch index and pushing the results
 * back to the firebase instance.
 */

require('dotenv').load();

const SEARCH_REQUEST = 'search/request';
const SEARCH_RESPONSE = 'search/response';
const HOST = `${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}`;
const LOG_LVL = 'error';
const INDEX = 'catalog';
const TYPE = 'book';

var ElasticSearch = require('elasticsearch');
var logger = require('tracer').colorConsole();
var db = require('../../database');
var client = new ElasticSearch.Client({
    host: HOST,
    log: LOG_LVL,
    apiVersion: '2.1',
    requestTimeout: Infinity
});

// Process search requests
db.child(SEARCH_REQUEST).on('child_added', processRequest);

function processRequest(snap) {
    if (snap.exists()) {
        let data = snap.val();

        // clear the request after we receive it
        snap.ref().remove();

        client.search({
            index: INDEX,
            type: TYPE,
            body: {
                query: {
                    match: {
                        title: data.title,
                        slug: data.slug,
                        genres: data.genres
                    }
                }
            }
        }, (error, response) => {
            if (error) {
                logger.error(error)
            } else {
                // Set search result back to firebase
                db.child(SEARCH_RESPONSE).set(response);
            }
        })
    }
}
