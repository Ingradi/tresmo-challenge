"use strict";

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;

chai.use(sinonChai);

var mongoose = require("mongoose");

var Wine = require("../../app/model/wine");
var WineQuery = require("../../app/model/wine-query");
var wineController =  require("../../app/controller/wine-controler");

describe("Wine controller", () => {
	var response = {};
	var nextCallback = {};

	beforeEach((done) => {
		response = {
			send: sinon.spy()
		};
		nextCallback = sinon.stub();
		done();
	});

	describe("Find wines", () => {
		var wines = [new Wine(), new Wine(), new Wine()];
		var request = {};
		var findStub = {};

		beforeEach((done) => {
			request = {
				query: {
					name: "",
					country: "",
					type: "",
					year: ""
				}
			};

			findStub = sinon.stub(Wine, "find");
			findStub.returns({exec: () => {
				wines.forEach((wine, index) => {
					wine._id = index + 1;
				});
				return Promise.resolve(wines);
			}});
			done();
		});

		afterEach((done) => {
			Wine.find.restore();
			done();
		});

		it("should search for all wines if query parameters are empty", () => {
			return wineController.findWines(request, response, nextCallback).then(() => {
				expect(Wine.find).to.have.been.calledWith({});
			});
		});

		it("should search for all wines if query is empty", () => {
			request.query = {};

			return wineController.findWines(request, response, nextCallback).then(() => {
				expect(Wine.find).to.have.been.calledWith({});
			});
		});

		it("should search for wines respecting query parameters", () => {
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

			return wineController.findWines(request, response, nextCallback).then(() => {
				expect(Wine.find).to.have.been.calledWith(query);
			});
		});

		it("should send list of found wines", () => {
			return wineController.findWines(request, response, nextCallback).then(() => {
				expect(response.send).to.have.been.calledWith([{id: 1}, {id: 2}, {id: 3}]);
			});
		});

		it("should call next controller on sucessful request", () => {
			return wineController.findWines(request, response, nextCallback).then(() => {
				expect(nextCallback).to.have.been.called;
			});
		});

		it("should call next controller on request error", () => {
			findStub.returns({exec: () => { return Promise.reject("TEST");}});
			return wineController.findWines(request, response, nextCallback).then(() => {
				expect(nextCallback).to.have.been.calledWith("TEST");
			});
		});
	});

	describe("Add wine", () => {
		var request = {};
		var saveStub = {};

		beforeEach((done) => {
			request = {
				body: {
					year: 1999,
					name: "test wine",
					country: "test country",
					type: "red"
				}
			};

			saveStub = sinon.stub(mongoose.Model.prototype, "save", function (callback) {
				this._id = 1;
				callback(null, this);
			});

			done();
		});

		afterEach((done) => {
			mongoose.Model.prototype.save.restore();
			done();
		});

		it("should call save on adding new wine", () => {
			return wineController.addWine(request, response, nextCallback).then(() => {
				expect(saveStub).to.have.been.called;
			});
		});

		it("should send added wine as response", () => {
			return wineController.addWine(request, response, nextCallback).then(() => {
				expect(response.send).to.have.been.calledWith(Object.assign(request.body, {id: 1}));
			});
		});

		it("should send error response on invalid input", () => {
			request.body.name = "";
			mongoose.Model.prototype.save.restore();
			sinon.stub(mongoose.Model.prototype, "save", (callback) => {
				(new Wine(request.body)).validate().catch((errors) => {
					callback(errors);
				});
			});
			return wineController.addWine(request, response, nextCallback).then(() => {
				expect(nextCallback).to.have.been.calledOnce;
				expect(nextCallback.getCall(0).args[0].body).to.eqls({
					error: "VALIDATION_ERROR",
					validation: {
						name: "MISSING"
					}
				});
				expect(nextCallback.getCall(0).args[0].statusCode).to.eql(400);
			});
		});
	});
	describe("Modify wine", () => {
		var existingWine = {};
		var request = {};
		var saveStub = {};
		var findByIdStub = {};

		beforeEach((done) => {
			request = {
				params: {
					id: 1
				},
				body: {

				}
			};

			saveStub = sinon.stub(mongoose.Model.prototype, "save", function (callback) {
				callback(null, this);
			});
			findByIdStub = sinon.stub(Wine, "findById", (id) => {
				if (id === 1) {
					existingWine._id = id;
					return Promise.resolve(existingWine);
				}
				return Promise.resolve(null);
			});
			existingWine = new Wine({
				year: 1999,
				name: "test wine",
				country: "test country",
				type: "red"
			});
			done();
		});

		afterEach((done) => {
			mongoose.Model.prototype.save.restore();
			Wine.findById.restore();
			done();
		});

		it("should modify wine with user input", () => {
			request.body.name = "New wine name";
			request.body.description = "Wine description";
			return wineController.modifyWine(request, response, nextCallback).then(() => {
				expect(findByIdStub).to.have.been.calledWith(1);
				expect(saveStub).to.have.been.called;
				expect(response.send).to.have.been.calledWith(Object.assign(existingWine.toObject(), {
					name: "New wine name",
					description: "Wine description"
				}));
			});
		});

		it("should not modify wine if nothing is entered", () => {
			return wineController.modifyWine(request, response, nextCallback).then(() => {
				expect(findByIdStub).to.have.been.calledWith(1);
				expect(saveStub).not.to.have.been.called;
				expect(response.send).to.have.been.calledWith(existingWine.toObject());
			});
		});

		it("should not modify wine if invalid data is entered", () => {
			request.body.name = "";
			return wineController.modifyWine(request, response, nextCallback).then(() => {
				expect(findByIdStub).to.have.been.calledWith(1);
				expect(saveStub).not.to.have.been.called;
				expect(response.send).not.to.have.been.called;
				expect(nextCallback).to.have.been.calledOnce;
				expect(nextCallback.getCall(0).args[0].body).to.eqls({
					error: "VALIDATION_ERROR",
					validation: {
						name: "MISSING"
					}
				});
				expect(nextCallback.getCall(0).args[0].statusCode).to.eql(400);
			});
		});

		it("should issue 'not found' if wine id is unknown", () => {
			request.params.id = 1000;
			return wineController.modifyWine(request, response, nextCallback).then(() => {
				expect(findByIdStub).to.have.been.calledWith(1000);
				expect(saveStub).not.to.have.been.called;
				expect(response.send).not.to.have.been.called;
				expect(nextCallback).to.have.been.calledOnce;
				expect(nextCallback.getCall(0).args[0].body).to.eqls({
					error: "UNKNOWN_OBJECT"
				});
				expect(nextCallback.getCall(0).args[0].statusCode).to.eql(400);
			});
		});
	});

	describe("Retrieve wine", () => {
		var existingWine = {};
		var request = {};
		var findByIdStub = {};

		beforeEach((done) => {
			request = {
				params: {
					id: 1
				}
			};
			findByIdStub = sinon.stub(Wine, "findById", (id) => {
				if (id === 1) {
					existingWine._id = id;
					return Promise.resolve(existingWine);
				}
				return Promise.resolve(null);
			});
			existingWine = new Wine({
				year: 1999,
				name: "test wine",
				country: "test country",
				type: "red"
			});
			done();
		});

		afterEach((done) => {
			Wine.findById.restore();
			done();
		});

		it("should find wine by existing id", () => {
			return wineController.getWine(request, response, nextCallback).then(() => {
				expect(findByIdStub).to.have.been.calledWith(1);
				expect(response.send).to.have.been.calledWith(existingWine.toObject());
			});
		});

		it("should issue 'not found' if wine id is unknown", () => {
			request.params.id = 1000;
			return wineController.getWine(request, response, nextCallback).then(() => {
				expect(findByIdStub).to.have.been.calledWith(1000);
				expect(response.send).not.to.have.been.called;
				expect(nextCallback).to.have.been.calledOnce;
				expect(nextCallback.getCall(0).args[0].body).to.eqls({
					error: "UNKNOWN_OBJECT"
				});
				expect(nextCallback.getCall(0).args[0].statusCode).to.eql(400);
			});
		});
	});

	describe("Delete wine", () => {
		var request = {};
		var findByIdAndRemoveStub = {};

		beforeEach((done) => {
			request = {
				params: {
					id: 1
				}
			};
			findByIdAndRemoveStub = sinon.stub(Wine, "findByIdAndRemove", (id) => {
				if (id === 1) {
					return Promise.resolve({id: 1});
				}
				return Promise.resolve(null);
			});
			done();
		});

		afterEach((done) => {
			Wine.findByIdAndRemove.restore();
			done();
		});

		it("should remove wine with existing id", () => {
			return wineController.deleteWine(request, response, nextCallback).then(() => {
				expect(findByIdAndRemoveStub).to.have.been.calledWith(1);
				expect(response.send).to.have.been.calledWith({success: true});
			});
		});

		it("should issue 'not found' if wine id is unknown", () => {
			request.params.id = 1000;
			return wineController.deleteWine(request, response, nextCallback).then(() => {
				expect(findByIdAndRemoveStub).to.have.been.calledWith(1000);
				expect(response.send).not.to.have.been.called;
				expect(nextCallback).to.have.been.calledOnce;
				expect(nextCallback.getCall(0).args[0].body).to.eqls({
					error: "UNKNOWN_OBJECT"
				});
				expect(nextCallback.getCall(0).args[0].statusCode).to.eql(400);
			});
		});
	});
});
