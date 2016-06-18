'use strict';

var chai = require("chai");
var expect = chai.expect;

var Wine = require("../../app/model/wine");
var helper = require("../../app/controller/helper");

describe("Helper methods", function () {
	describe("Create validation error from model errors", function () {
		it("should create error with markers for each missing property", function () {
			var invalid = new Wine({});
			return invalid.validate().catch(function (errors) {
				var error = helper.convertToValidationError(errors);
				expect(error.statusCode).to.equal(400);
				expect(error.body).to.eql({
					error: 'VALIDATION_ERROR',
					validation: {
						country: 'MISSING',
						name: 'MISSING',
						type: 'MISSING',
						year: 'MISSING'
					}
				});
			});
		});
	});
});
