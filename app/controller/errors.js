var restify = require('restify');
var util = require('util');

function ValidationError(message) {
	restify.RestError.call(this, {
		restCode: 'VALIDATION_ERROR',
		statusCode: 400,
		message: message,
		constructorOpt: ValidationError
	});
	this.name = 'VALIDATION_ERROR';
	this.body.error = this.body.code;
	this.body.validation = this.body.message;
	delete this.body.code;
	delete this.body.message;
}

util.inherits(ValidationError, restify.RestError);

module.exports.ValidationError = ValidationError;
