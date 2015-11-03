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
