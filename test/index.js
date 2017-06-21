/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';


var kraken = require('kraken-js');
var express = require('express');
var path = require('path');
var request = require('supertest');
var assert = require('assert');

describe('index', function () {

    var app, mock;


    beforeEach(function (done) {
        app = express();
        app.on('start', done);
        app.use(kraken({
            basedir: path.resolve(__dirname, '..')
        }));

        mock = app.listen(1337);

    });


    afterEach(function (done) {
        mock.close(done);
    });


    it('should say "hello"', function (done) {
        request(mock)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/)

                .expect(/Hello, /)

            .end(function (err, res) {
                done(err);
            });
    });

    it('should work with non-bcp47 country', function(done) {
        request(mock)
            .get('/?country=C2&language=zh')
            .expect(200)
            .end(function(err, res) {
                assert.equal(res.text, '<!DOCTYPE html><html lang="zh-C2" data-langpack="/zh-C2/_languagepack"><head><meta charset="utf-8" /><title></title><link rel="stylesheet" href="/css/app.css"></head><body><div id="wrapper"><h1>C2 Hello, index!</h1><h3>C2 example.dust rendered on the server!</h3><div id="exampletarget"></div></div><script data-main="/js/app" src="/js/components/requirejs/require.js"></script></body></html>');
                done(err);
            })
    })

});
