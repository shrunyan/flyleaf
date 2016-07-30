'use strict';

const API_EN_LIST = '/api/list/0/';

var logger = require('tracer').colorConsole();
var netto = require('netto');
var bookModel = require('../../../database/models/book');
var db = require('../../../database');
var catalog = db.child('catalog');

// Fetch Manga Eden data and store
// to our firebase instance
netto.root = 'www.mangaeden.com';
netto.node('get', API_EN_LIST, null, function (err, data) {
    if (err) {
        logger.log(err);
    } else {
        data = JSON.parse(data);
        logger.debug(`Fetched ${data.manga.length} books.`);

        let books = data.manga.map(manga => {
            return bookModel({
                _id: manga.i,
                title: manga.t,
                slug: manga.a,
                genres: manga.c,
                hits: manga.h,
                coverImage: manga.im,
                lastChapterDate: manga.ld || null,
                status: manga.s
            });
        });

        catalog.set(books);

        logger.debug('Posted books to firebase');
    }
});
