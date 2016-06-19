'use strict';

var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
var cleaner = require("../../app/utils/mongo-clean-middleware")();

describe("Mongo clean middleware", function() {
	var nextCallback = {};
	var testDirtyContent = {
		key1: "key1",
		key2: "$key2",
		key3: "$key3$"
	};
	var testCleanContent = {
		key1: "key1",
		key2: "key2",
		key3: "key3"
	};
	beforeEach(function(done) {
		nextCallback = sinon.stub();
		done();
	});

	it("should remove all $ signs from request body", function (done) {
		var request = {
			body: testDirtyContent
		};
		cleaner(request, {}, nextCallback);
		expect(request.body).to.be.eqls(testCleanContent);
		expect(nextCallback).to.have.been.called;
		done();
	});

	it("should leave request body as is if no $ sign is found", function (done) {
		var request = {
			body: testCleanContent
		};
		cleaner(request, {}, nextCallback);
		expect(request.body).to.be.eqls(testCleanContent);
		expect(nextCallback).to.have.been.called;
		done();
	});

	it("should remove all $ signs from request parameters", function (done) {
		var request = {
			params: testDirtyContent
		};
		cleaner(request, {}, nextCallback);
		expect(request.params).to.be.eqls(testCleanContent);
		expect(nextCallback).to.have.been.called;
		done();
	});

	it("should leave request parameter as is if no $ sign is found", function (done) {
		var request = {
			params: testCleanContent
		};
		cleaner(request, {}, nextCallback);
		expect(request.params).to.be.eqls(testCleanContent);
		expect(nextCallback).to.have.been.called;
		done();
	});

	it("should remove all $ signs from request query", function (done) {
		var request = {
			query: testDirtyContent
		};
		cleaner(request, {}, nextCallback);
		expect(request.query).to.be.eqls(testCleanContent);
		expect(nextCallback).to.have.been.called;
		done();
	});

	it("should leave request query as is if no $ sign is found", function (done) {
		var request = {
			query: testCleanContent
		};
		cleaner(request, {}, nextCallback);
		expect(request.query).to.be.eqls(testCleanContent);
		expect(nextCallback).to.have.been.called;
		done();
	});

	it("should remove all $ signs from request body, parameters, query", function (done) {
		var request = {
			query: testDirtyContent,
			params: testDirtyContent,
			body: testDirtyContent
		};
		cleaner(request, {}, nextCallback);
		expect(request.query).to.be.eqls(testCleanContent);
		expect(request.params).to.be.eqls(testCleanContent);
		expect(request.body).to.be.eqls(testCleanContent);
		expect(nextCallback).to.have.been.called;
		done();
	});
});
