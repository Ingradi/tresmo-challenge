'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');

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

describe("Wine model", function() {
	// before(function(done) {
	// 	if (mongoose.connection.db) {
	// 		return done();
	// 	}
	// 	mongoose.connect('mongodb://localhost/wine-test', done);
	// });
	//
	// after(function(done){
	// 	mongoose.connection.db.dropDatabase(function() {
	// 		mongoose.connection.db.close(function() {
	// 			done();
	// 		});
	// 	});
	// });

	describe("Validating wine", function () {
		it("should have errors when name is undefined", function(done){
			var wine = new Wine({
				year: 2013,
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['name'].kind).to.be.equal('required');
				done();
			});
		});

		it("should have errors when name is empty", function(done){
			var wine = new Wine({
				name: "",
				year: 2013,
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['name'].kind).to.be.equal('required');
				done();
			});
		});

		it("should have errors when year is empty", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['year'].kind).to.be.equal('required');
				done();
			});
		});

		it("should have errors when year is not a number", function(done){
			var wine = new Wine({
				year: "Test",
				name: "Cabernet sauvignon",
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['year'].kind).to.be.equal('Number');
				done();
			});
		});

		it("should have errors when country is undefined", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				type: "red",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['country'].kind).to.be.equal('required');
				done();
			});
		});

		it("should have errors when country is empty", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['country'].kind).to.be.equal('required');
				done();
			});
		});

		it("should have errors when type is undefined", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['type'].kind).to.be.equal('required');
				done();
			});
		});

		it("should have errors when type is empty", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['type'].kind).to.be.equal('required');
				done();
			});
		});

		it("should have errors when type is not valid", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "illegal type",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error.errors['type'].kind).to.be.equal('enum');
				done();
			});
		});

		it("should have no errors when type is 'red'", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error).to.be.empty;
				done();
			});
		});

		it("should have no errors when type is 'white'", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "white",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error).to.be.empty;
				done();
			});
		});

		it("should have no errors when type is 'rose'", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "rose",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error).to.be.empty;
				done();
			});
		});

		it("should have no errors when description is undefined", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "red"
			});
			wine.validate(function(error) {
				expect(error).to.be.empty;
				done();
			});
		});

		it("should have no errors when description is empty", function(done){
			var wine = new Wine({
				name: "Cabernet sauvignon",
				year: 2013,
				country: "France",
				type: "red",
				description: ""
			});
			wine.validate(function(error) {
				expect(error).to.be.empty;
				done();
			});
		});

		it("should have no errors when name,country,year,type are not empty, year is numeric and type is valid", function(done){
			var wine = new Wine({
				year: 2013,
				name: "Cabernet sauvignon",
				country: "France",
				type: "red",
				description: "The Sean Connery of red wines"
			});
			wine.validate(function(error) {
				expect(error).to.be.empty;
				done();
			});
		});
	});

	describe("Finding wines", function() {
		var existingWines = [];
		beforeEach(function() {
			return Promise.all(
				testWines.map(function(item) {
					var wine = new Wine(item);
					return wine.save().then(function () {
						return wine;
					});
				})
			).then(function(wines) {
				existingWines = wines;
			});
		});

		afterEach(function(){
			return Wine.remove({}).then(function () {
				existingWines = [];
			});
		});

		it("should find wine by id", function () {
			return Wine.findById(existingWines[0]._id).then(function(wine) {
				expect(wine.toObject()).to.eql(existingWines[0].toObject());
			});
		});

		it("should find all wines if no query is provided", function() {
			return Wine.query().find().then(function (wines) {
				expect(wines.length).to.equal(existingWines.length);
			});
		});

		it("should find wines by year", function() {
			return Wine.query()
				.byYear(1999)
				.find()
				.exec()
				.then(function (wines) {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by full name", function() {
			return Wine.query()
				.byName("Cabernet sauvignon")
				.find()
				.exec()
				.then(function (wines) {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by name part", function() {
			return Wine.query()
				.byName("Cabernet")
				.find()
				.exec()
				.then(function (wines) {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by type", function() {
			return Wine.query()
				.byType("red")
				.find()
				.exec()
				.then(function (wines) {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by country", function() {
			Wine.query()
				.byCountry("Italy")
				.find()
				.exec()
				.then(function (wines) {
					expect(wines.length).to.equal(1);
				});
		});

		it("should find wines by year, name, type and country", function() {
			Wine.query()
				.byName("Delicious")
				.byCountry("Italy")
				.byType("white")
				.byYear(1999)
				.find()
				.exec()
				.then(function (wines) {
					expect(wines.length).to.equal(1);
				});
		});

		it("should return empty list if no wines are found", function() {
			Wine.query()
				.byName("not available")
				.find()
				.exec()
				.then(function (wines) {
					expect(wines.length).to.equal(0);
				});
		});
	});

	describe("Transforming wine model to json", function() {
		var existingWine = {};
		beforeEach(function() {
			var wine = new Wine(testWines[0]);
			return wine.save().then(function () {
				existingWine = wine;
			});
		});

		afterEach(function(){
			return Wine.remove({}).then(function () {
				existingWine = {};
			});
		});

		it("should transform model to simple object with id property", function () {
			expect(existingWine.toObject()).to.be.eql(Object.assign(testWines[0], {id: existingWine._id}));
		})
	});
});
