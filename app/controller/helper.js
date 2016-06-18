'use strict';
var errors = require("./errors");

module.exports = {

	convertToValidationError: function(validationErrors) {
		return new errors.ValidationError(Object.keys(validationErrors.errors)
			.map(function (key) {
				return validationErrors.errors[key];
			})
			.map(function(validationError) {
				if (validationError.kind === "required") {
					return {[validationError.path]: 'MISSING'};
				}
				return {[validationError.path]: 'INVALID'};
			}).reduce(function(aggregated, current) {
				return Object.assign(aggregated, current);
			}));
	}
};
