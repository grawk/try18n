# try18n

Compiling dustjs in the browser, with i18n, using PayPal's Dust/Makara helpers.

This example uses browserify for browser JS dependency management.

It also uses Grunt and some very specific tasks as described below.

The instructions below are roughly a diff from what you'd get when you run `generator-kraken` and generate a basic app with makara2 content.  

## Load appropriate libraries into the browser

In order to perform the i18n-enabled compilation in the browser, we need the browser version of `dust-makara-helpers`.


`dust-makara-helpers` has a `browserPackage` section in its package.json file, something like this:

```js
"browserPackage": {
    "main": "browser.js"
  },
```

That is an indicator to `copy-browser-modules` (see below under Grunt tasks) to copy files out of this module for 
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

`npm i --save-dev grunt-copy-browser-modules grunt-browserify grunt-makara-browserify`

`npm i --save dustjs-linkedin@~v2.7.0 dust-message-helper browserify jquery`

(make sure you have installed a 2.7 version of dust as breaking changes are possible on minor versions)

### Grunt tasks:


The following grunt tasks (and their core functionality, which can be wrapped into gulp or other tasks):

* https://github.com/aredridel/grunt-copy-browser-modules
  * Uses: https://github.com/aredridel/copy-browser-modules

We will add a new grunt task to the `postinstall` script in our package.json:

```js
    "postinstall": "grunt postinstall"
```

Then, in our Gruntfile, we define the `postinstall` task:

```js
grunt.registerTask('postinstall', ['copy-browser-modules']);
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

tasks/browserify

```js
'use strict';

module.exports = function browserify(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-browserify');

	// Options
	return {
		build: {
			src: './public/js/main.js',
			dest: '.build/js/bundle.js'
		}
	};
};
```


You'll want to be sure you don't check in any copied files to github. So add the following to your .gitignore file:

```
public/components
```

### Run new postinstall task

After all of our changes, we can run `npm install` and note the postinstall tasks output something like the following:

```shell
> try18n@0.1.0 postinstall /Users/medelman/src/krakex/try18n
> grunt postinstall

Running "copy-browser-modules:build" (copy-browser-modules) task

Done, without errors.
```

Note the new directory `public/js/components`.

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

To support the above changes, we need to write/register a locale middleware and install/register `makara-browserify` middleware.

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

Second, let's install `makara-browserify` and register its middleware:

```bash
npm install --save makara-browserify
```

In config.json let's register both of these middlewares:

```js
"locale": {
    "priority": 118,
    "enabled": true,
    "module": "path:./lib/locale"
},
"makaraBrowserify": {
    "priority": 119,
    "enabled": true,
    "module": {
        "name": "makara-browserify",
        "method": "middleware"
    }
},
```

As you may have astutely guessed, `makara-browserify` requires that a locale be set so it can calculate the appropriate 
languagepack path.

Now add the following to "public/templates/layouts/master.dust":

```html
    <script src="{context.links.resourceBaseUrl|s}/{makara.languagePackPath|s}" ></script>
```

Now, we will replace the current app.js with the following as main.js:

```js
var $ = require('jquery');

dust.onLoad = function(templateName, callback) {
	console.log("loading template", templateName);
	$.get('/templates/' + templateName + '.js', function(data) {
		var res=dust.loadSource(data);
		callback(null,res);
	});
};

var loader = function(ctx, bundle, callback){
	console.log('loader ctx ', JSON.stringify(ctx), ' bundle', bundle);
	console.log(JSON.stringify(langPack,0,4));
	callback(null,langPack[getLang()][bundle]);
};

require('dust-makara-helpers').registerWith(dust, {
	enableMetadata: true,
	autoloadTemplateContent: false,
	loader:loader
});

function getLang() {
	console.log(document.documentElement.getAttribute('lang'))
	return document.documentElement.getAttribute('lang');
}

$(function () {
	dust.render('example', {where: 'browser'}, function (err, data) {
		if (err) {
			console.warn(err);
		} else {
			$('#exampletarget')[0].innerHTML = data;
			window.readyToGo = true;
		}
	});
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
npm install --save-dev construx-browserify construx-makara-browserify
```

Now let's configure `construx-makara-browserify` and re-configure `construx-dustjs` in development.json:

```js
"browserify-languagepack": {
    "module": "construx-makara-browserify",
    "files": "**/_languagepack.js",
    "i18n": "config:i18n",
    "ext": "js"
},
"browserify": {
    "module": "construx-browserify",
    "files": "/js/*.js",
    "bundles": {
        "/js/bundle.js": {
            "src": "path:./public/js/main.js"
        }
    }
},
"dust": {
    "module": "construx-dustjs",
    "files": "/templates/**/*.js",
    "base": "templates",
    "ext": "dust",
    "config": {
        "prepend": "",
        "append": "",
        "amd": false
    }
},
```

NOW, you can delete your .build directory, restart your app, and hit the default route. How cool! It Just Works!!
