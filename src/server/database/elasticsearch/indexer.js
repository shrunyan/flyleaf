'use strict';

/**
 * This worker listens for add, change & remove
 * events on the firebase database. Then updates
 * the Elasticsearch index accordingly.
 *
 * This ensures the Elasticsearch index is fresh.
 */

require('dotenv').load();

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

var fb = db.child(INDEX);
fb.on('child_added', createOrUpdateIndex);
fb.on('child_changed', createOrUpdateIndex);
fb.on('child_removed', removeIndex);

function callback(error, response) {
    if (error) {
        logger.error('ElasticSearch Error | ', error);
    } else {
        logger.debug('ElasticSearch Event', response);
    }
}

function createOrUpdateIndex(snap) {
    if (snap.exists()) {

        let data = snap.val()

        client.index({
            index: INDEX,
            type: TYPE,
            id: snap.key(),
            body: {
                title: data.title,
                genres: data.genres,
                slug: data.slug,
                status: data.status
            }
        }, callback);
    }
}

function removeIndex(snap) {
    if (snap.exists()) {
        client.delete({
            index: INDEX,
            type: TYPE,
            id: snap.key()
        }, callback);
    }
}
