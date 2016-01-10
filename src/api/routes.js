'use strict';

var search = require('./controllers/search');

module.exports = (app) => {
	app.use('/search/:term', search);
}
