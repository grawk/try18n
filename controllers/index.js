'use strict';

var IndexModel = require('../models/index');

var lp = {
    "fr-FR": {
        "welcome.properties": {
            "welcome_title": "FR: Welcome to {app}",
            "welcome_phrase1": "FR: We are glad to have you here!",
            "welcome_phrase2": "FR: Please, access the link below and create your authentication."
        }
    },
    "en-US": {
        "welcome.properties": {
            "welcome_title": "US: Welcome to {app}",
            "welcome_phrase1": "US: We are glad to have you here!",
            "welcome_phrase2": "US: Please, access the link below and create your authentication."
        }
    }
};

var fs = require('fs');
var path = require('path');

module.exports = function (router) {

    var model = new IndexModel();
    var freshy = require('freshy');

    var dust = freshy.freshy('dustjs-linkedin');
    require('dust-makara-helpers').registerWith(dust, {
        enableMetadata: false,
        autoloadTemplateContent: false,
        loader: function (context, bundle, cb) {
            cb(null, lp[context.get('locale')][bundle]);
        }
    });
    router.get('/', function (req, res) {
        //do some dust rendering here...
        var src = fs.readFileSync(path.resolve(__dirname, '../public/templates/welcome.dust')).toString();
        dust.loadSource(dust.compile(src, 'welcome'));
        dust.render('welcome', {
            app: 'welcomeApp',
            templateName: 'welcome',
            locale: 'fr-FR',
            user: 'foo',
            admin: 'James',
            email: 'james@localhost',
            host: 'http://localhost',
            port: '8000',
            cipher: 'abc123'
        }, function(err, out) {
            console.log('>>>>>> err: ' + err);
            console.log('>>>>>> out: ' + out);
            res.render('index', model);

        });
    });

};
