"use strict";

var chai = require("chai");
var expect = chai.expect;

var Wine = require("../../app/model/wine");
var helper = require("../../app/controller/helper");

describe("Helper methods", () => {
	describe("Create validation error from model errors", () => {
		it("should return original error if errors are not validation errors", (done) => {
			var error = helper.convertToValidationError({error: "my custom error"});
			expect(error).to.be.eql({error: "my custom error"});
			done();
		});

		it("should create error with markers for each missing property", () => {
			var invalid = new Wine({});
			return invalid.validate().catch((errors) => {
				var error = helper.convertToValidationError(errors);
				expect(error.statusCode).to.equal(400);
				expect(error.body).to.eql({
					error: "VALIDATION_ERROR",
					validation: {
						country: "MISSING",
						name: "MISSING",
						type: "MISSING",
						year: "MISSING"
					}
				});
			});
		});
	});
});
