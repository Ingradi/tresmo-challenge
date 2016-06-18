var Restify = require('restify');

module.exports = function() {
	'use strict';

	var server = Restify.createServer({
		name: 'wine-app'
	});

	server.use(Restify.queryParser());
	server.use(Restify.bodyParser({ mapParams: false }));
	// routes(server);
};
