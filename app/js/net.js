'use strict';

var netProto  = {
    xhr: function (type, path, data, callback) {
        if (data === null || data === undefined) {
            data = '';
        }
        var request = new XMLHttpRequest();
        request.open(type, path, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status !== 200) callback(new Error('XHR Failed: ' + path), null);
            if (request.readyState !== 4 || request.status !== 200) return;
            callback(null, request.responseText);
        };
        request.send(data);
    },

    proxy: function (path, callback) {
        this.xhr('post', '/proxy', path, callback);
    },

    get: function (path, callback) {
        this.xhr('get', path, null, callback);
    },

    getJson: function (path, callback) {
        this.get(path, function (err, data) {
            callback(err, JSON.parse(data));
        });
    },
    postJson: function (path, json, callback) {
        this.xhr('post', path, json, function (err, data) {
            callback(err, JSON.parse(data));
        });
    }
};
var Net = Object.create(netProto);
