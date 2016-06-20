"use strict";

module.exports = function() {
	var Restify = require("restify");
	var xss = require("xss-clean");
	var routes = require("./configuration/routes");
	var database = require("./configuration/database");
	var logger = require("./utils/logger");

	var server = Restify.createServer({
		name: "wine-app"
	});

	server.use(Restify.queryParser());
	server.use(Restify.bodyParser({ mapParams: false }));
	server.use(xss());
	server.use((req, res, next) => {
		res.charSet("utf-8");
		next();
	});

	server.on('after', Restify.auditLogger({
		log: logger.AuditLogger,
		body: true
	}));

	database(server);
	routes(server);

	var port = process.env.PORT || "8080";
	server.listen(port, () => {
		logger.AppLogger.info("%s listening at %s", server.name, server.url);
	});

	return server;
};
