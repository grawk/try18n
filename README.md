# try18n

Compiling dustjs in the browser, with i18n, using PayPal's Dust/Makara helpers.

This example uses requirejs/amd for browser JS dependency management.

It also uses Grunt and some very specific tasks as described below.

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

`npm i --save dustjs-linkedin@~v2.7.0 dust-message-helper`

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
