'use strict';

module.exports = function () {
    return function (req, res, next) {
        res.locals.locale = {
            country: req.query.country || 'US',
            language: req.query.language || 'en'
        };
        next();
    };
};
