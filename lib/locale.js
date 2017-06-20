'use strict';

module.exports = function () {
    return function (req, res, next) {
        var language = req.query.language || 'en';
        var country = req.query.country || 'US';

        res.locals.locale = res.locals.blocale = {
            country: country,
            language: language
        };

        res.locals.makaraLocale = {
            langtag: {
                language: {
                    language: language
                },
                region: country
            }
        };

        next();
    };
};
