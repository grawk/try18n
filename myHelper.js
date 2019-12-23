(function(root, factory) {
    if (typeof define === 'function' && define.amd && define.amd.dust === true) {
      define(['dust.core'], factory);
    } else if (typeof module === 'object') {
      module.exports = factory(require('dustjs-linkedin'));
      module.exports.registerWith = factory;
    } else {
      factory(root.dust);
    }
  }(this, function (dust) {
    dust.helpers.myHelper = function myHelper(chunk, context, bodies, params) {
        console.log(context); //context.locals is where you find your data model
        return true;
    }
    return dust;
  }));