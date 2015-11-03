'use strict';


require(['_config'], function (config) {
    require(['dustjs-linkedin', 'dust-makara-helpers/browser.amd', 'require' /*, Your modules */ ], function(dust, dmh, require) {

        // We make our own dust-to-AMD bridge because the built-in one in
        // dust 2.7.2 is funky and communicates via the cache.
        dust.onLoad = function(name, cb) {
            require([name], function (tmpl) {
                cb(null, tmpl);
            });
        };

        dmh.registerWith(dust, {
            autoloadTemplateContent: true,
            loader: function (context, bundle, cb) {
                require(['_languagepack'], function (lp) {
                    cb(null, lp[getLang()][bundle]);
                });
            }
        });

        dust.render('templates/example.dust', {where: 'browser'}, function (err, data) {
            if (err) {
                console.warn(err);
            } else {
                document.querySelector('#exampletarget').innerHTML = data;
                window.readyToGo = true;
            }
        });

        // Code here
        // set a flag to indicate your application is fully ready for interaction
        window.readyToGo = false;
        //simulate some pre-loading of assets, building of views, etc.

    });

    function getLang() {
        return document.documentElement.getAttribute('lang');
    }
});
