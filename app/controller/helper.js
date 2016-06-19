"use strict";
var errors = require("./errors");

module.exports = {

	convertToValidationError: (validationErrors) => {
		if (!validationErrors || validationErrors.name !== "ValidationError") {
			return validationErrors;
		}
		return new errors.ValidationError(Object.keys(validationErrors.errors)
			.map((key) => validationErrors.errors[key])
			.map((validationError) => {
				if (validationError.kind === "required") {
					return {[validationError.path]: "MISSING"};
				}
				return {[validationError.path]: "INVALID"};
			})
			.reduce((aggregated, current) => Object.assign(aggregated, current)));
	}
};
