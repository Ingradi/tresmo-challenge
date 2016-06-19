
module.exports = function (server) {
	'use strict';

	var mongoose = require('mongoose');
	var mongoClean = require("../utils/mongo-clean-middleware");

	var dbURI = 'mongodb://localhost/wine-app';
	mongoose.connect(dbURI);

	mongoose.connection.on('connected', function () {
		console.log('Mongoose default connection open to ' + dbURI);
	});

	mongoose.connection.on('error', function (err) {
		console.log('Mongoose default connection error: ' + err);
	});

	mongoose.connection.on('disconnected', function () {
		console.log('Mongoose default connection disconnected');
	});

	process.on('SIGINT', function() {
		mongoose.connection.close(function () {
			console.log('Mongoose default connection disconnected through app termination');
			process.exit(0);
		});
	});

	server.use(mongoClean());
};
