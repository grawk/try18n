# try18n

Compiling dustjs in the browser, with i18n, using PayPal's Dust/Makara helpers.

This example uses requirejs/amd for browser JS dependency management.

It also uses Grunt and some very specific tasks as described below.

This app was generated with the following parameters to `generator-kraken`:

```shell
LM-SJN-00872356:krakex medelman$ yo kraken try18n

     ,'""`. 
hh  / _  _ \
    |(@)(@)|   Release the Kraken!
    )  __  (
   /,'))((`.\ 
  (( ((  )) ))
   `\ `)(' /'

Tell me a bit about your application:

? Description: i18n sample for dust, makara2, requirejs
? Author: Matt Edelman
? Template library? Dust (via Makara 2)
? Include i18n support? Yes
? Front end package manager ? No
? CSS preprocessor library? LESS
? JavaScript library? RequireJS
```

## Load appropriate libraries into the browser

In order to perform the i18n-enabled compilation in the browser, we need the browser versions of the appropriate dust 
helpers:
* dust-makara-helpers
* dust-message-helpers
* dust-usecontent-helper

Note that each of the above modules have a `browserPackage` section in their package.json file, something like this:

```js
"browserPackage": {
    "main": "browser.js"
  },
```

That is an indicator to `copy-browser-modules` (see below under Grunt tasks) to copy files out of those modules for 
use in the browser.

`dustjs-linkedin`, which is also required in the browser, does not have this `browserPackage` property in its 
package.json. But never fear, we can add an override in our main package.json as follows:

```js
  "browserPackage": {
    "overrides": {
      "dustjs-linkedin": {
        "main": "dist/dust-full"
      }
    }
  }
```
### Installing new stuff

`npm i --save-dev grunt-copy-browser-modules grunt-put-packages-in-requirejs-config`

`npm i --save dustjs-linkedin@~v2.7.0 dust-message-helper requirejs`

(make sure you have installed a 2.7 version of dust as breaking changes are possible on minor versions)

### Grunt tasks:


The following grunt tasks (and their core functionality, which can be wrapped into gulp or other tasks):

* https://github.com/aredridel/grunt-copy-browser-modules
  * Uses: https://github.com/aredridel/copy-browser-modules
* https://github.com/aredridel/grunt-put-packages-in-requirejs-config
  * Uses: https://github.com/aredridel/put-packages-in-requirejs-config
  
We will add a new grunt task to the `postinstall` script in our package.json:

```js
    "postinstall": "grunt postinstall"
```

Then, in our Gruntfile, we define the `postinstall` task:

```js
grunt.registerTask('postinstall', ['copy-browser-modules', 'put-packages-in-requirejs-config']);
```

Task configurations for these tasks are as follows (note: I used `grunt-config-dir`, so each task is configured by 
a separate file):

tasks/copy-browser-modules.js
```js
'use strict';

module.exports = function dustjs(grunt) {
    grunt.loadNpmTasks('grunt-copy-browser-modules');

    return {
        build: {
            root: process.cwd(),
            dest: 'public/js/components',
            basePath: 'public/js'
        }
    };
};
```

tasks/put-packages-in-requirejs-config
```js
'use strict';

module.exports = function dustjs(grunt) {
    grunt.loadNpmTasks('grunt-put-packages-in-requirejs-config');

    return {
        packages: {
            options: {
                src: 'public/js/config.js',
                dest: 'public/js/_config.js',
                packages: 'public/js/components'
            }
        }
    };
};
```

You'll want to be sure you don't check in any generated files to github. So add the following to your .gitignore file:

```
public/components
public/js/_config.js
```

To take advantage of the `put-packages-in-requirejs-config` task, we need to create a base `public/js/config.js` file:

```js
'use strict';

requirejs.config({
    packages: []
});
define.amd.dust = true;
```

`put-packages-in-requirejs-config` will add the appropriate values in the `packages` section, and write out as 
`_config.js`, which we will reference in app.js:

```js
'use strict';


require(['_config'], function (config) {
    //application code here
});

```

### Run new postinstall task

After all of our changes, we can run `npm install` and note the postinstall tasks output something like the following:

```shell
> try18n@0.1.0 postinstall /Users/medelman/src/krakex/try18n
> grunt postinstall

Running "copy-browser-modules:build" (copy-browser-modules) task

Running "put-packages-in-requirejs-config:packages" (put-packages-in-requirejs-config) task

Done, without errors.
```

Note the new directory `public/js/components`.

Also note the new file `public/js/_config.js`, with the populated `packages` array:

```js
packages: [
        {
            'name': 'dust-makara-helpers',
            'version': '4.1.2',
            'location': 'components/dust-makara-helpers',
            'main': 'browser.js'
        },
        {
            'name': 'dust-message-helper',
            'version': '4.2.1',
            'location': 'components/dust-message-helper',
            'main': 'index.js'
        },
        {
            'name': 'dust-usecontent-helper',
            'version': '4.0.1',
            'location': 'components/dust-usecontent-helper',
            'main': 'index.js'
        },
        {
            'name': 'dustjs-linkedin',
            'version': '2.7.2',
            'location': 'components/dustjs-linkedin',
            'main': 'dist/dust-full'
        }
    ]
```

## Changes for browser dustjs rendering

We need to alter how we manage our dust templates just a bit. Because dust will try and resolve 
partials like "foo/bar/header" as "foo/bar/header.dust". When mixed with requirejs, this means we 
need to name our templates with as *.dust.js. To that end, we will use the grunt task called 
`grunt-dustjs-configurable`.

```bash
npm install --save-dev grunt-dustjs-configurable
```

Replace the `dustjs` sub-task in the grunt `build` task:

```js
grunt.registerTask('build', ['jshint', 'dustjs-configurable', 'makara-amdify', 'less', 'requirejs', 'copyto']);
```

Add the `tasks/dustjs-configurable.js` file:

```js
'use strict';

var path = require('path');

module.exports = function dustjs(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-dustjs-configurable');

    // Options
    return {
        amd: {
            files: [
                {
                    expand: true,
                    cwd: 'public/templates',
                    src: '**/*.dust',
                    dest: '.build/js/templates',
                    ext: '.dust.js'
                }
            ],
            options: {
                amd: true,
                fullname: function (filepath) {
                    return path.relative('public', filepath);
                }
            }
        }
    };
};
```

Now, when we run `grunt build` we see that our dust templates have been compiled (but not localized) to `.build/js/templates`.

## Adding a client rendered template

### Make and render new template server side

Create public/templates/example.dust:

```html
{@useContent bundle="example.properties"}
<h3>{@message key="greeting"/}</h3>
{/useContent}
```

Create locales/US/en/example.properties:

```
greeting=example.dust rendered on the {where}!
```

Add a "where" property to the server side data model for the default route (models/index.js):

```js
'use strict';

module.exports = function IndexModel() {
    return {
        name: 'index',
        where: 'server'
    };
};
```

Add a reference to "example.dust" in "index.dust", and also an empty div which we will use later for browser rendering:

```html
{>"layouts/master" /}

{<body}
    <h1>{@pre type="content" key="greeting"/}</h1>
    {>"example" /}
    <div id="exampletarget"></div>
{/body}
```

You should be able to refresh the default route and see the new partial. Note it is rendering on the server.

### Modifications for client side rendering

First, we need to communicate the current locale, and base path for languagepack files. Replace the existing `html` tag 
with the following:

```html
<html lang="{locale.language}-{locale.country}" data-langpack="{context.links.resourceBaseUrl|s}/{makara.languagePackPath|s}">
```

To support the above changes, we need to write/register a locale middleware and install/register `makara-amdify` middleware.

First, locale middleware. Create lib/locale.js:

```js
'use strict';

module.exports = function () {
    return function (req, res, next) {
        res.locals.locale = {
            country: 'US',
            language: 'en'
        };
        next();
    };
};
```

Second, let's install `makara-amdify` and register its middleware:

```bash
npm install --save makara-amdify
```

In config.json let's register both of these middlewares:

```js
"locale": {
    "priority": 118,
    "enabled": true,
    "module": "path:./lib/locale"
},
"makaraAMDify": {
    "priority": 119,
    "enabled": true,
    "module": {
        "name": "makara-amdify",
        "method": "middleware"
    }
},
```

As you may have astutely guessed, `makara-amdify` requires that a locale be set so it can calculate the appropriate 
languagepack path.

Now add the following to "public/js/config.js" (remember not to edit _config.js, as that file is generated by our grunt task above):

```js
    paths: { '_languagepack': document.documentElement.getAttribute('data-langpack') }
```

Now, we will replace the current app.js with the following:

```js
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

```

Now build/restart your app and try the default route. You should now see both the server rendered and client rendered 
version of "example.dust".

## Loading different languages

You can specify `country=FR&language=fr` on the query string for the default route to see French content.

## Setting up for development

We don't want to rebuild our app every time we want to see a change to the client-rendered template or properties file. 
So let's install a couple `construx` modules and configure them for development mode.

```
npm install --save-dev construx-makara-amdify construx-dustjs-makara-amd-precompile
```

Now let's configure `construx-makara-amdify` and re-configure `construx-dustjs` in development.json:

```js
"makara-amdify": {
    "module": "construx-makara-amdify",
    "files": "**/_languagepack.js",
    "i18n": "config:i18n",
    "ext": "js"
},
"dust": {
    "module": "construx-dustjs",
    "files": "/js/templates/**/*.js",
    "base": "templates",
    "ext": "dust",
    "config": {
        "prepend": "",
        "append": "",
        "amd": true
    },
    "precompile": "require:construx-dustjs-makara-amd-precompile"
},
```

NOW, you can delete your .build directory, restart your app, and hit the default route. How cool! It Just Works!!
