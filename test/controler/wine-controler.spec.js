'use strict';

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;

chai.use(sinonChai);

var mongoose = require('mongoose');

var Wine = require("../../app/model/wine");
var WineQuery = require("../../app/model/wine-query");
var wineController =  require("../../app/controller/wine-controler");

describe("Wine controller", function() {
	describe("Find wines", function () {
		var wines = [{id: 1}, {id: 2}, {id: 3}];
		var request = {};
		var response = {};
		var nextCallback = {};
		var findStub = {};

		beforeEach(function(done) {
			request = {
				query: {
					name: "",
					country: "",
					type: "",
					year: ""
				}
			};
			response = {
				send: sinon.spy()
			};
			nextCallback = sinon.spy();

			findStub = sinon.stub(Wine, 'find');
			findStub.returns({exec: function() {return Promise.resolve(wines);}});
			done();
		});

		afterEach(function (done) {
			Wine.find.restore();
			done();
		});

		it("should search for all wines if query parameters are empty", function() {
			return wineController.findWines(request, response, nextCallback).then(function() {
				expect(Wine.find).to.have.been.calledWith({});
			});
		});

		it("should search for all wines if query is empty", function() {
			request.query = {};

			return wineController.findWines(request, response, nextCallback).then(function() {
				expect(Wine.find).to.have.been.calledWith({});
			});
		});

		it("should search for wines respecting query parameters", function() {
			request.query.name="test name";
			request.query.country="test country";
			request.query.type="test type";
			request.query.year=2000;

			var query = new WineQuery()
				.byName(request.query.name)
				.byCountry(request.query.country)
				.byType(request.query.type)
				.byYear(request.query.year)
				.query;

			return wineController.findWines(request, response, nextCallback).then(function() {
				expect(Wine.find).to.have.been.calledWith(query);
			});
		});

		it("should send list of found wines", function() {
			return wineController.findWines(request, response, nextCallback).then(function() {
				expect(response.send).to.have.been.calledWith(wines);
			});
		});

		it("should call next controller on sucessful request", function() {
			return wineController.findWines(request, response, nextCallback).then(function() {
				expect(nextCallback).to.have.been.called;
			});
		});

		it("should call next controller on request error", function() {
			findStub.returns({exec: function() { return Promise.reject("TEST");}});
			return wineController.findWines(request, response, nextCallback).then(function() {
				expect(nextCallback).to.have.been.calledWith("TEST");
			});
		});
	});

	describe("Add wine", function () {
		var request = {};
		var response = {};
		var nextCallback = {};
		var saveStub = {};

		beforeEach(function(done) {
			request = {
				body: {
					year: 1999,
					name: "test wine",
					country: "test country",
					type: "red"
				}
			};
			response = {
				send: sinon.spy()
			};
			nextCallback = sinon.stub();
			nextCallback.returns(Promise.resolve(true));

			saveStub = sinon.stub(mongoose.Model.prototype, "save", function (cb) {
				this._id = 1;
				cb(null, this);
			});

			done();
		});

		afterEach(function(){
			mongoose.Model.prototype.save.restore();
			return Wine.remove({});
		});

		it("should call save on adding new wine", function() {
			return wineController.addWine(request, response, nextCallback).then(function () {
				expect(saveStub).to.have.been.called;
			});
		});

		it("should send added wine as response", function() {
			return wineController.addWine(request, response, nextCallback).then(function () {
				expect(response.send).to.have.been.calledWith(Object.assign(request.body, {id: 1}));
			});
		});

		it("should send error response on invalid input", function() {
			request.body.name = "";
			mongoose.Model.prototype.save.restore();
			sinon.stub(mongoose.Model.prototype, "save", function (cb) {
				(new Wine(request.body)).validate().catch(function (errors) {
					cb(errors);
				});
			});
			return wineController.addWine(request, response, nextCallback).then(function () {
				expect(nextCallback).to.have.been.calledOnce;
				expect(nextCallback.getCall(0).args[0].body).to.eqls({
					error: "VALIDATION_ERROR",
					validation: {
						name: 'MISSING'
					}
				});
				expect(nextCallback.getCall(0).args[0].statusCode).to.eql(400);
			});
		});
	});
	describe("Modify wine", function () {});
	describe("Retrieve wine", function () {});
	describe("Delete wine", function () {});

});
