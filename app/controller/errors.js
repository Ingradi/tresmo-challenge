"use strict";

var restify = require("restify");
var util = require("util");

function ValidationError(message) {
	restify.RestError.call(this, {
		restCode: "VALIDATION_ERROR",
		statusCode: 400,
		message: message,
		constructorOpt: ValidationError
	});
	this.name = "VALIDATION_ERROR";
	this.body.error = this.body.code;
	this.body.validation = this.body.message;
	delete this.body.code;
	delete this.body.message;
}
util.inherits(ValidationError, restify.RestError);

function NotFoundError() {
	restify.RestError.call(this, {
		restCode: "UNKNOWN_OBJECT",
		statusCode: 400,
		message: "",
		constructorOpt: NotFoundError
	});
	this.name = "UNKNOWN_OBJECT";
	this.body.error = this.body.code;
	delete this.body.code;
	delete this.body.message;
}
util.inherits(NotFoundError, restify.RestError);

module.exports.ValidationError = ValidationError;
module.exports.NotFoundError = NotFoundError;
