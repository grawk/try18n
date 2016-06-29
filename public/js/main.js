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