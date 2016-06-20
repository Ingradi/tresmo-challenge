"use strict";

module.exports = (server) => {
	var mongoose = require("mongoose");
	var logger = require("./utils/logger");
	mongoose.Promise = global.Promise;

	var mongoClean = require("../utils/mongo-clean-middleware");

	var dbURI = process.env.MONGODB_URI;
	if (!dbURI || dbURI.length === 0) {
		throw new Error("No mongodb uri specified! Please set MONGODB_URI environment variable before running this app.");
	}
	mongoose.connect(dbURI);

	mongoose.connection.on("connected", () => {
		logger.AppLogger.info("Mongoose default connection open to " + dbURI);
	});

	mongoose.connection.on("error", (err) => {
		logger.AppLogger.error("Mongoose default connection error: " + err);
	});

	mongoose.connection.on("disconnected", () => {
		logger.AppLogger.info("Mongoose default connection disconnected");
	});

	var closeConnection = () => {
		mongoose.connection.close(() => {
			logger.AppLogger.info("Mongoose default connection disconnected through app termination");
			process.exit(0);
		});
	};

	process.on("SIGTERM", closeConnection);
	process.on("SIGINT", closeConnection);

	server.use(mongoClean());
};
