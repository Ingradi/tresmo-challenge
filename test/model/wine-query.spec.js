'use strict';

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var WineQuery = require("../../app/model/wine-query");

describe("Wine query builder", function() {
	var model = {};
	beforeEach(function(done) {
		model = {
			find: sinon.spy()
		};
		done();
	});

	it("should ignore empty name", function () {
		var query = (new WineQuery(model))
			.byName()
			.query;
		expect(query).to.eql({});
	});

	it("should add name as regex to query", function () {
		var query = (new WineQuery(model))
			.byName("test name")
			.query;
		expect(query).to.eql({
			name: {"$regex": "test name"}
		});
	});

	it("should ignore empty country", function () {
		var query = (new WineQuery(model))
			.byCountry()
			.query;
		expect(query).to.eql({});
	});

	it("should add country to query", function () {
		var query = (new WineQuery(model))
			.byCountry("test country")
			.query;
		expect(query).to.eql({
			country: "test country"
		});
	});

	it("should ignore empty type", function () {
		var query = (new WineQuery(model))
			.byType()
			.query;
		expect(query).to.eql({});
	});

	it("should add type to query", function () {
		var query = (new WineQuery(model))
			.byType("test type")
			.query;
		expect(query).to.eql({
			type: "test type"
		});
	});

	it("should ignore empty year", function () {
		var query = (new WineQuery(model))
			.byYear()
			.query;
		expect(query).to.eql({});
	});

	it("should ignore non numeric year", function () {
		var query = (new WineQuery(model))
			.byYear("abc")
			.query;
		expect(query).to.eql({});
	});

	it("should add year to query", function () {
		var query = (new WineQuery(model))
			.byYear(2000)
			.query;
		expect(query).to.eql({
			year: 2000
		});
	});

	it("should add multiple criterias to query", function () {
		var query = (new WineQuery(model))
			.byYear(2000)
			.byCountry("test country")
			.byName("test name")
			.byType("test type")
			.query;
		expect(query).to.eql({
			year: 2000,
			country: "test country",
			type: "test type",
			name: {"$regex": "test name"}
		});
	});

	it("should invoke model's find on find", function () {
		(new WineQuery(model)).find();
		expect(model.find).to.have.been.calledWith({});
	});
});
