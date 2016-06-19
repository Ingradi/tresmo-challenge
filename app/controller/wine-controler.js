var Wine = require('../model/wine');
var helper = require("./helper");
var errors = require("./errors");

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
					return next(helper.convertToValidationError(error));
				});
		},
		modifyWine: function (req, res, next) {
			return Wine.findById(req.params.id)
				.then(function (wine) {
					if (wine === null) {
						return Promise.reject("NOT_FOUND");
					}
					return wine.updateWith(req.body);
				}).then(function (wine) {
					res.send(wine.toObject());
					return next();
				}).catch(function (error) {
					if (error === "NOT_FOUND") {
						return next(new errors.NotFoundError());
					}
					return next(helper.convertToValidationError(error));
				})
		},
		getWine: function (req, res, next) {
			return Wine.findById(req.params.id)
				.then(function (wine) {
					if (wine === null) {
						return Promise.reject("NOT_FOUND");
					}
					res.send(wine.toObject());
					return next();
				}).catch(function (error) {
					if (error === "NOT_FOUND") {
						return next(new errors.NotFoundError());
					}
					return next(error);
				});
		},
		deleteWine: function (req, res, next) {
			return Wine.findByIdAndRemove(req.params.id)
				.then(function (wine) {
					if (wine === null) {
						return Promise.reject("NOT_FOUND");
					}
					res.send({success: true});
					return next();
				}).catch(function (error) {
					if (error === "NOT_FOUND") {
						return next(new errors.NotFoundError());
					}
					return next(error);
				});
		}
	};
}();
