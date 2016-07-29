'use strict';

var IndexModel = require('../models/index');




var fs = require('fs');
var path = require('path');

module.exports = function (router) {

    var model = new IndexModel();
    var dustjs = require('dustjs-linkedin'),
      freshy = require('freshy');

    var dust = freshy.freshy('dustjs-linkedin');
    var dustMakaraHelpers = require('dust-makara-helpers').registerWith(dust, {
        enableMetadata: true,
        autoloadTemplateContent: false,
        loader: function (context, bundle, cb) {
            require(['_languagepack'], function (lp) {
                cb(null, lp[getLang()][bundle]);
            });
        }
    });
    router.get('/', function (req, res) {
        //do some dust rendering here...
        var welcomePath = path.resolve(__dirname, '../public/templates/welcome.dust');
        console.log('welcomePath', welcomePath);
        var src = fs.readFileSync(path.resolve(__dirname, '../public/templates/welcome.dust')).toString();
        console.log('src', src);
        //dust.config.amd = false;
        //dust.config.cjs = true;
        var compiledTemplate = dust.compile(src, 'welcome');
        dust.loadSource(compiledTemplate);
        dust.render('welcome', dust.context({
            templateName: 'welcome',
            intl: { locales: 'en-US' },
            user: 'foo',
            admin: 'James',
            host: 'http://localhost',
            port: '8000',
            cipher: 'abc123'
        }), function(err, out) {
            console.log('>>>>>> err: ' + err);
            console.log('>>>>>> out: ' + out);
        });
        res.render('index', model);
    });

};
