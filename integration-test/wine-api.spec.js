'use strict';

var mongoose = require('mongoose');
var chai = require("chai");
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var expect = chai.expect;

var bootstrap = require('../app/bootstrap');
var Wine = require("../app/model/wine");

process.env.MONGODB_URI='mongodb://localhost/wine-integration-test';

var testWines = [{
		year: 2013,
		name: "Cabernet sauvignon",
		country: "France",
		type: "red",
		description: "The Sean Connery of red wines"
	}, {
		year: 1999,
		name: "Delicious white wine",
		country: "Italy",
		type: "white",
		description: "Perfect fit for fish"
	}, {
		year: 1956,
		name: "Extraordinary Rose",
		country: "USA",
		type: "rose",
		description: "Perfect drink for a hot summer evening"
	}, {
		year: 1967,
		name: "Another red wine",
		country: "Australia",
		type: "red",
		description: "Mmmmm tastyyyy"
	}
];

describe("Wine API", function () {
	var server = {};
	var existingWines = [];
	before(function (done) {
		server = bootstrap();
		done();
	});

	after(function(done){
		mongoose.connection.db.dropDatabase(function() {
			mongoose.connection.db.close(function() {
				done();
			});
		});
	});

	beforeEach(function () {
		return Promise.all(
			testWines.map(function (item) {
				var wine = new Wine(item);
				return wine.save().then(function (wine) {
					existingWines.push(wine.toObject());
				});
			}));
	});

	afterEach(function () {
		return Wine.remove({}).then(function () {
			existingWines = [];
		});
	});

	describe("Find wines", function () {

		it("should return all wines if query is empty", function () {
			return chai.request(server)
				.get('/wines')
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eqls(existingWines);
				}).catch(function (err) {
					throw err;
				});
		});

		it("should return empty list if no wines matching the query are found", function () {
			return chai.request(server)
				.get('/wines?type=red&year=1950')
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eqls([]);
				}).catch(function (err) {
					throw err;
				});
		});

		it("should return all red wines", function () {
			return chai.request(server)
				.get('/wines?type=red')
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eqls(existingWines.filter((wine) => wine.type === "red"));
				}).catch(function (err) {
					throw err;
				});
		});

		it("should return wines with name like 'wine'", function () {
			return chai.request(server)
				.get('/wines?name=wine')
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eqls(existingWines.filter((wine) => wine.name.indexOf('wine') > -1));
				}).catch(function (err) {
					throw err;
				});
		});

		it("should prevent query injection", function () {
			return chai.request(server)
				.get('/wines?country={"$regex": "al"}')
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eqls([]);
				}).catch(function (err) {
					throw err;
				});
		});
	});

	describe("Add wine", function () {
		it("should add a new wine", function () {
			var newWine = {
				name: 'New wine',
				country: 'France',
				type: 'white',
				year: 2000,
				description: 'This is an amazing wine!'
			};
			return chai.request(server)
				.post('/wines')
				.send(newWine)
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.have.property('id');
					expect(res.body).to.be.eql(Object.assign(newWine, {id: res.body.id}));
				}).catch(function (err) {
					throw err;
				});
		});

		it("should send error response if required fields are not submitted", function () {
			var newWine = {};
			return chai.request(server)
				.post('/wines')
				.send(newWine)
				.then(function (res) {
					throw res;
				}).catch(function (err) {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(err.response.body).to.be.eqls({
						error: 'VALIDATION_ERROR',
						validation: {
							country: 'MISSING',
							year: 'MISSING',
							name: 'MISSING',
							type: 'MISSING'
						}
					});
				});
		});

		it("should send error response if year is not a number", function () {
			var newWine = {
				name: 'New wine',
				type: 'white',
				year: 'abc'
			};
			return chai.request(server)
				.post('/wines')
				.send(newWine)
				.then(function (res) {
					throw res;
				}).catch(function (err) {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(err.response.body).to.be.eqls({
						error: 'VALIDATION_ERROR',
						validation: {
							country: 'MISSING',
							year: 'INVALID'
						}
					});
				});
		});
	});

	describe("Modify wine", function () {
		it("should update wine's single property", function () {
			var changes = {
				name: 'Changed wine name'
			};
			return chai.request(server)
				.put('/wines/' + existingWines[0].id)
				.send(changes)
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eql(Object.assign(existingWines[0], changes));
				}).catch(function (err) {
					throw err;
				});
		});

		it("should update wine's multiple properties", function () {
			var changes = {
				name: 'Changed wine name',
				country: 'New country'
			};
			return chai.request(server)
				.put('/wines/' + existingWines[0].id)
				.send(changes)
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eql(Object.assign(existingWines[0], changes));
				}).catch(function (err) {
					throw err;
				});
		});

		it("should send original wine if no changes are sent", function () {
			var changes = {};
			return chai.request(server)
				.put('/wines/' + existingWines[0].id)
				.send(changes)
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eql(existingWines[0]);
				}).catch(function (err) {
					throw err;
				});
		});

		it("should send error if submitted values are invalid", function () {
			var changes = {
				name: '',
				year: 'abc'
			};
			return chai.request(server)
				.put('/wines/' + existingWines[0].id)
				.send(changes)
				.then(function (res) {
					throw res;
				}).catch(function (err) {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(err.response.body).to.be.eqls({
						error: 'VALIDATION_ERROR',
						validation: {
							name: 'MISSING',
							year: 'INVALID'
						}
					});
				});
		});

		it("should send error if wine is not found", function () {
			var changes = {
				name: 'Changed'
			};
			return chai.request(server)
				.put('/wines/1000')
				.send(changes)
				.then(function (res) {
					throw res;
				}).catch(function (err) {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(err.response.body).to.be.eqls({error: 'UNKNOWN_OBJECT'});
				});
		});
	});

	describe("Delete wine", function () {
		it("should delete wine by id", function () {
			return chai.request(server)
				.del('/wines/' + existingWines[0].id)
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eqls({success: true});
				}).catch(function (err) {
					throw err;
				});
		});

		it("should return error if id is unknown", function () {
			return chai.request(server)
				.del('/wines/1000')
				.then(function (res) {
					throw res;
				}).catch(function (err) {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(err.response.body).to.be.eqls({error: 'UNKNOWN_OBJECT'});
				});
		});
	});

	describe("Get wine", function () {
		it("should return wine by id", function () {
			return chai.request(server)
				.get('/wines/' + existingWines[0].id)
				.then(function (res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(res.body).to.be.eqls(existingWines[0]);
				}).catch(function (err) {
					throw err;
				});
		});

		it("should return error if id is unknown", function () {
			return chai.request(server)
				.get('/wines/1000')
				.then(function (res) {
					throw res;
				}).catch(function (err) {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header('Content-Type', 'application/json; charset=utf-8');
					expect(err.response.body).to.be.eqls({error: 'UNKNOWN_OBJECT'});
				});
		});
	});
});

