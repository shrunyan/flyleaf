'use strict';
/* jshint node:true */

require('dotenv').load();

const PORT = process.env.PORT || 8080

var express     = require('express'),
    path        = require('path'),
    morgan      = require('morgan'),
    stylus      = require('stylus'),
    // routes      = require('./routes'),
    cookieParser= require('cookie-parser'),
    bodyParser  = require('body-parser'),
    multer      = require('multer'),
    webpack     = require('webpack');

var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname + '/../dist')));
app.use('/docs', express.static(path.join(__dirname + '/../docs/flyleaf/0.1.0')));
app.use('/material', express.static(path.join(__dirname + '/../node_modules/materialize-css')));

// routes(app);

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
