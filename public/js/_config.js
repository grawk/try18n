'use strict';
requirejs.config({
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
        },
        {
            'name': 'requirejs',
            'version': '2.1.20',
            'location': 'components/requirejs',
            'main': 'require'
        }
    ],
    paths: { '_languagepack': document.documentElement.getAttribute('data-langpack') }
});
define.amd.dust = true;