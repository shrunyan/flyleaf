'use strict';

const API_EN_LIST = '/api/list/0/';

var logger = require('tracer').colorConsole();
var db = require('../../database');
// var mangaeden = db.child('sources').child('mangaeden');
var mangaeden = db.child('catalog');
var netto = require('netto');

mangaeden.set([{test:'test'}]);


// Fetch Manga Eden data and store
// to our firebase instance
// netto.root = 'www.mangaeden.com';
// netto.node('get', API_EN_LIST, null, function (err, data) {
//     if (err) {
//         logger.log(err);
//     } else {
//         data = JSON.parse(data);
//         logger.debug(`Fetched ${data.manga.length} books.`);

//         let books = data.manga.map(manga => {
//         	return {
// 						_id: manga.i,
// 						title: manga.t,
// 						slug: manga.a,
// 						genres: manga.c,
// 						hits: manga.h,
// 						coverImage: manga.im,
// 						lastChapterDate: manga.ld || null,
// 						status: manga.s
//           }
//         });

//         mangaeden.set(books);

//         logger.debug('Posted books to firebase');
//     }
// });
