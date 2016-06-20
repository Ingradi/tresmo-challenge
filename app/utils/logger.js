"use strict";

var Bunyan = require("bunyan");
module.exports.AuditLogger = Bunyan.createLogger({
	name: "audit",
	stream: process.stdout,
	level: process.env.AUDIT_LOG_LEVEL || "info"
});

module.exports.AppLogger = Bunyan.createLogger({
	name: "app",
	stream: process.stdout,
	level: process.env.APP_LOG_LEVEL || "info"
});
