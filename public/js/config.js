'use strict';


requirejs.config({
    packages: [],
    paths: { '_languagepack': document.documentElement.getAttribute('data-langpack') }
});
define.amd.dust = true;
