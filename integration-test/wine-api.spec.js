"use strict";

var mongoose = require("mongoose");
var chai = require("chai");
var chaiHttp = require("chai-http");
chai.use(chaiHttp);
var expect = chai.expect;

var bootstrap = require("../app/bootstrap");
var Wine = require("../app/model/wine");

process.env.MONGODB_URI="mongodb://localhost/wine-integration-test";

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

describe("Wine API", () => {
	var server = {};
	var existingWines = [];
	before((done) => {
		server = bootstrap();
		done();
	});

	after((done) => {
		mongoose.connection.db.dropDatabase(() => {
			mongoose.connection.db.close(() => {
				done();
			});
		});
	});

	beforeEach(() => {
		return Promise.all(
			testWines.map((item) => {
				var wine = new Wine(item);
				return wine.save().then((wine) => {
					existingWines.push(wine.toObject());
				});
			}));
	});

	afterEach(() => {
		return Wine.remove({}).then(() => {
			existingWines = [];
		});
	});

	describe("Find wines", () => {

		it("should return all wines if query is empty", () => {
			return chai.request(server)
				.get("/wines")
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body.length).to.be.equal(existingWines.length);
					expect(res.body).to.include.deep.members(existingWines);
				}).catch((err) => {
					throw err;
				});
		});

		it("should return empty list if no wines matching the query are found", () => {
			return chai.request(server)
				.get("/wines?type=red&year=1950")
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body).to.be.eqls([]);
				}).catch((err) => {
					throw err;
				});
		});

		it("should return all red wines", () => {
			var expectedResult = existingWines.filter((wine) => wine.type === "red");
			return chai.request(server)
				.get("/wines?type=red")
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body.length).to.be.equal(expectedResult.length);
					expect(res.body).to.include.deep.members(expectedResult);
				}).catch((err) => {
					throw err;
				});
		});

		it("should return wines with name like 'wine'", () => {
			var expectedResult = existingWines.filter((wine) => wine.name.indexOf("wine") > -1);
			return chai.request(server)
				.get("/wines?name=wine")
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body.length).to.be.equal(expectedResult.length);
					expect(res.body).to.include.deep.members(expectedResult);
				}).catch((err) => {
					throw err;
				});
		});

		it("should prevent query injection", () => {
			return chai.request(server)
				.get("/wines?country={'$regex': 'al'}")
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body).to.be.eqls([]);
				}).catch((err) => {
					throw err;
				});
		});
	});

	describe("Add wine", () => {
		it("should add a new wine", () => {
			var newWine = {
				name: "New wine",
				country: "France",
				type: "white",
				year: 2000,
				description: "This is an amazing wine!"
			};
			return chai.request(server)
				.post("/wines")
				.send(newWine)
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body).to.have.property("id");
					expect(res.body).to.be.eql(Object.assign(newWine, {id: res.body.id}));
				}).catch((err) => {
					throw err;
				});
		});

		it("should send error response if required fields are not submitted", () => {
			var newWine = {};
			return chai.request(server)
				.post("/wines")
				.send(newWine)
				.then((res) => {
					throw res;
				}).catch((err) => {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(err.response.body).to.be.eqls({
						error: "VALIDATION_ERROR",
						validation: {
							country: "MISSING",
							year: "MISSING",
							name: "MISSING",
							type: "MISSING"
						}
					});
				});
		});

		it("should send error response if year is not a number", () => {
			var newWine = {
				name: "New wine",
				type: "white",
				year: "abc"
			};
			return chai.request(server)
				.post("/wines")
				.send(newWine)
				.then((res) => {
					throw res;
				}).catch((err) => {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(err.response.body).to.be.eqls({
						error: "VALIDATION_ERROR",
						validation: {
							country: "MISSING",
							year: "INVALID"
						}
					});
				});
		});
	});

	describe("Modify wine", () => {
		it("should update wine's single property", () => {
			var changes = {
				name: "Changed wine name"
			};
			return chai.request(server)
				.put("/wines/" + existingWines[0].id)
				.send(changes)
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body).to.be.eql(Object.assign(existingWines[0], changes));
				}).catch((err) => {
					throw err;
				});
		});

		it("should update wine's multiple properties", () => {
			var changes = {
				name: "Changed wine name",
				country: "New country"
			};
			return chai.request(server)
				.put("/wines/" + existingWines[0].id)
				.send(changes)
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body).to.be.eql(Object.assign(existingWines[0], changes));
				}).catch((err) => {
					throw err;
				});
		});

		it("should send original wine if no changes are sent", () => {
			var changes = {};
			return chai.request(server)
				.put("/wines/" + existingWines[0].id)
				.send(changes)
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body).to.be.eql(existingWines[0]);
				}).catch((err) => {
					throw err;
				});
		});

		it("should send error if submitted values are invalid", () => {
			var changes = {
				name: "",
				year: "abc"
			};
			return chai.request(server)
				.put("/wines/" + existingWines[0].id)
				.send(changes)
				.then((res) => {
					throw res;
				}).catch((err) => {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(err.response.body).to.be.eqls({
						error: "VALIDATION_ERROR",
						validation: {
							name: "MISSING",
							year: "INVALID"
						}
					});
				});
		});

		it("should send error if wine is not found", () => {
			var changes = {
				name: "Changed"
			};
			return chai.request(server)
				.put("/wines/1000")
				.send(changes)
				.then((res) => {
					throw res;
				}).catch((err) => {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(err.response.body).to.be.eqls({error: "UNKNOWN_OBJECT"});
				});
		});
	});

	describe("Delete wine", () => {
		it("should delete wine by id", () => {
			return chai.request(server)
				.del("/wines/" + existingWines[0].id)
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body).to.be.eqls({success: true});
				}).catch((err) => {
					throw err;
				});
		});

		it("should return error if id is unknown", () => {
			return chai.request(server)
				.del("/wines/1000")
				.then((res) => {
					throw res;
				}).catch((err) => {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(err.response.body).to.be.eqls({error: "UNKNOWN_OBJECT"});
				});
		});
	});

	describe("Get wine", () => {
		it("should return wine by id", () => {
			return chai.request(server)
				.get("/wines/" + existingWines[0].id)
				.then((res) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(res.body).to.be.eqls(existingWines[0]);
				}).catch((err) => {
					throw err;
				});
		});

		it("should return error if id is unknown", () => {
			return chai.request(server)
				.get("/wines/1000")
				.then((res) => {
					throw res;
				}).catch((err) => {
					expect(err.response).to.have.status(400);
					expect(err.response).to.be.json;
					expect(err.response).to.have.header("Content-Type", "application/json; charset=utf-8");
					expect(err.response.body).to.be.eqls({error: "UNKNOWN_OBJECT"});
				});
		});
	});
});

