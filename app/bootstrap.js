
module.exports = function() {
	'use strict';

	var Restify = require('restify');
	var xss = require('xss-clean');
	var routes = require("./configuration/routes");
	var database = require("./configuration/database");

	var server = Restify.createServer({
		name: 'wine-app'
	});

	server.use(Restify.queryParser());
	server.use(Restify.bodyParser({ mapParams: false }));
	server.use(xss());
	server.use(function (req, res, next) {
		res.charSet("utf-8");
		next();
	});

	database(server);
	routes(server)

	server.listen(8080, function() {
		console.log('%s listening at %s', server.name, server.url);
	});

	return server;
};
