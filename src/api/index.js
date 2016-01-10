'use strict';
/* jshint node:true */

require('dotenv').load();

var logger = require('tracer').colorConsole();
var express     = require('express');
var morgan      = require('morgan');
var routes     		= require('./routes');
var bodyParser  = require('body-parser');

var app = express();

if (process.env.DEV) {
	app.use(morgan('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

routes(app);

app.listen((process.env.PORT || 8080), () => {
    logger.log('Server started');
});
