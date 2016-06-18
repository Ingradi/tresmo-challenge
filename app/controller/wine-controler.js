var Wine = require('../model/wine');
var helper = require("./helper");

module.exports = function() {
	'use strict';

	return {
		findWines: function (req, res, next) {
			return Wine.query()
				.byName(req.query.name)
				.byCountry(req.query.country)
				.byType(req.query.type)
				.byYear(req.query.year)
				.find()
				.exec()
				.then(function(wines) {
					res.send(wines);
					return next();
				})
				.catch(function(error) {
					return next(error);
				});
		},
		addWine: function (req, res, next) {
			var wine = new Wine(req.body);
			return wine.save()
				.then(function () {
					res.send(wine.toObject());
					return next();
				}).catch(function(error) {
					var result = helper.convertToValidationError(error);
					return next(result);
				});
		},
		updateWine: function (req, res, next) {
			next();
		},
		getWine: function (req, res, next) {
			next();
		},
		deleteWine: function (req, res, next) {
			next();
		}
	};
}();
