"use strict";

var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;

var mongoose = require("mongoose");

mongoose.Promise = global.Promise;

var Wine = require("../../app/model/wine");

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
	}
];

describe("Wine model", () => {
	describe("Validating wine", () => {
		it("should have errors when name is undefined", () => {
			var wine = new Wine({
				year: 2013,
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["name"].kind).to.be.equal("required");
			});
		});

		it("should have errors when name is empty", () => {
			var wine = new Wine({
				name: "",
				year: 2013,
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["name"].kind).to.be.equal("required");
			});
		});

		it("should have errors when year is empty", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["year"].kind).to.be.equal("required");
			});
		});

		it("should have errors when year is not a number", () => {
			var wine = new Wine({
				year: "Test",
				name: "Cabernet sauvignon",
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["year"].kind).to.be.equal("Number");
			});
		});

		it("should have errors when year is less then 1", () => {
			var wine = new Wine({
				year: -20,
				name: "Cabernet sauvignon",
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["year"].kind).to.be.equal("min");
			});
		});

		it("should have errors when country is undefined", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["country"].kind).to.be.equal("required");
			});
		});

		it("should have errors when country is empty", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["country"].kind).to.be.equal("required");
			});
		});

		it("should have errors when type is undefined", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["type"].kind).to.be.equal("required");
			});
		});

		it("should have errors when type is empty", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["type"].kind).to.be.equal("required");
			});
		});

		it("should have errors when type is not valid", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "illegal type",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then(() => {
				throw new Error();
			}).catch((error) => {
				expect(error.errors["type"].kind).to.be.equal("enum");
			});
		});

		it("should have no errors when type is 'red'", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then((data) => {
				expect(data).to.be.empty;
			}).catch((error) => {
				throw error;
			});
		});

		it("should have no errors when type is 'white'", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "white",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then((data) => {
				expect(data).to.be.empty;
			}).catch((error) => {
				throw error;
			});
		});

		it("should have no errors when type is 'rose'", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "rose",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then((data) => {
				expect(data).to.be.empty;
			}).catch((error) => {
				throw error;
			});
		});

		it("should have no errors when description is undefined", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "red"
			});
			return wine.validate().then((data) => {
				expect(data).to.be.empty;
			}).catch((error) => {
				throw error;
			});
		});

		it("should have no errors when description is empty", () => {
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "red",
				description: ""
			});
			return wine.validate().then((data) => {
				expect(data).to.be.empty;
			}).catch((error) => {
				throw error;
			});
		});

		it("should have no errors when name,country,year,type are not empty, year is numeric and type is valid", () => {
			var wine = new Wine({
				year: 2013,
				name: "Cabernet sauvignon",
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			return wine.validate().then((data) => {
				expect(data).to.be.empty;
			}).catch((error) => {
				throw error;
			});
		});
	});

	describe("Finding wines", () => {
		var existingWines = [];
		beforeEach(() => {
			return Promise.all(
				testWines.map((item) => {
					var wine = new Wine(item);
					return wine.save().then(() => {
						return wine;
					});
				})
			).then((wines) => {
				existingWines = wines;
			});
		});

		afterEach(() => {
			return Wine.remove({}).then(() => {
				existingWines = [];
			});
		});

		it("should find wine by id", () => {
			return Wine.findById(existingWines[0]._id).then((wine) => {
				expect(wine.toObject()).to.eql(existingWines[0].toObject());
			});
		});

		it("should return null if wine id is unknown", () => {
			return Wine.findById(2000).then((wine) => {
				expect(wine).to.be.null;
			});
		});

		it("should find and remove wine by id", () => {
			return Wine.findByIdAndRemove(existingWines[0]._id).then((wine) => {
				expect(wine._id).to.be.equal(existingWines[0]._id);
				return Wine.findById(wine._id).then((data) => {
					expect(data).to.be.null;
				});
			});
		});

		it("should not try to remove wine with unknown id", () => {
			return Wine.findByIdAndRemove(1000).then((wine) => {
				expect(wine).to.be.null;
			});
		});

		it("should find all wines if no query is provided", () => {
			return Wine.query().find().then((wines) => {
				expect(wines.length).to.equal(existingWines.length);
			});
		});

		it("should find wines by year", () => {
			return Wine.query()
				.byYear(1999)
				.find()
				.exec()
				.then((wines) => {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by full name", () => {
			return Wine.query()
				.byName("Cabernet sauvignon")
				.find()
				.exec()
				.then((wines) => {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by name part", () => {
			return Wine.query()
				.byName("Cabernet")
				.find()
				.exec()
				.then((wines) => {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by type", () => {
			return Wine.query()
				.byType("red")
				.find()
				.exec()
				.then((wines) => {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by country", () => {
			return Wine.query()
				.byCountry("Italy")
				.find()
				.exec()
				.then((wines) => {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by year, name, type and country", () => {
			return Wine.query()
				.byName("Delicious")
				.byCountry("Italy")
				.byType("white")
				.byYear(1999)
				.find()
				.exec()
				.then((wines) => {
					expect(wines.length).to.equal(1);
				});
		});

		it("should return empty list if no wines are found", () => {
			return Wine.query()
				.byName("not available")
				.find()
				.exec()
				.then((wines) => {
					expect(wines.length).to.equal(0);
				});
		});
	});

	describe("Transforming wine model to json", () => {
		var existingWine = {};
		beforeEach(() => {
			var wine = new Wine(testWines[0]);
			return wine.save().then(() => {
				existingWine = wine;
			});
		});

		afterEach(() => {
			return Wine.remove({}).then(() => {
				existingWine = {};
			});
		});

		it("should transform model to simple object with id property", () => {
			return expect(existingWine.toObject()).to.be.eql(Object.assign(testWines[0], {id: existingWine._id}));
		})
	});

	describe("Updating existing wine", () => {
		var existingWine = {};
		var saveSpy = {};
		beforeEach(() => {
			saveSpy = sinon.spy(mongoose.Model.prototype, "save");
			var wine = new Wine(testWines[0]);
			return wine.save().then(() => {
				existingWine = wine;
				saveSpy.reset();
			});
		});

		afterEach(() => {
			mongoose.Model.prototype.save.restore();
			return Wine.remove({}).then(() => {
				existingWine = {};
			});
		});

		it("should do nothing if modifications are empty", () => {
			return existingWine.updateWith().then(() => {
				expect(saveSpy).not.to.have.been.called;
			});
		});

		it("should update single property", () => {
			return existingWine.updateWith({year: 1999}).then(() => {
				expect(saveSpy).to.have.been.called;
				expect(existingWine.year).to.be.equal(1999);
			});
		});

		it("should update multiple properties", () => {
			return existingWine.updateWith({year: 1999, name: "New name"}).then(() => {
				expect(saveSpy).to.have.been.called;
				expect(existingWine.year).to.be.equal(1999);
				expect(existingWine.name).to.be.equal("New name");
			});
		});

		it("should run validations and not save invalid values", () => {
			return existingWine.updateWith({name: ""}).catch((error) => {
				expect(saveSpy).not.to.have.been.called;
				expect(error.errors["name"].kind).to.be.equal("required");
			});
		});
	});
});
