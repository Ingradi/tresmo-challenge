"use strict";

module.exports = function() {
	var Wine = require("../model/wine");
	var helper = require("./helper");
	var errors = require("./errors");

	return {
		findWines: (req, res, next) => {
			return Wine.query()
				.byName(req.query.name)
				.byCountry(req.query.country)
				.byType(req.query.type)
				.byYear(req.query.year)
				.find()
				.exec()
				.then((wines) => {
					res.send(wines.map((wine) => wine.toObject()));
					return next();
				})
				.catch((error) => {
					return next(error);
				});
		},
		addWine: (req, res, next) => {
			var wine = new Wine(req.body);
			return wine.save()
				.then(() => {
					res.send(wine.toObject());
					return next();
				}).catch((error) => {
					return next(helper.convertToValidationError(error));
				});
		},
		modifyWine: (req, res, next) => {
			return Wine.findById(req.params.id)
				.then((wine) => {
					if (wine === null) {
						return Promise.reject("NOT_FOUND");
					}
					return wine.updateWith(req.body);
				}).then((wine) => {
					res.send(wine.toObject());
					return next();
				}).catch((error) => {
					if (error === "NOT_FOUND") {
						return next(new errors.NotFoundError());
					}
					return next(helper.convertToValidationError(error));
				})
		},
		getWine: (req, res, next) => {
			return Wine.findById(req.params.id)
				.then((wine) => {
					if (wine === null) {
						return Promise.reject("NOT_FOUND");
					}
					res.send(wine.toObject());
					return next();
				}).catch((error) => {
					if (error === "NOT_FOUND") {
						return next(new errors.NotFoundError());
					}
					return next(error);
				});
		},
		deleteWine: (req, res, next) => {
			return Wine.findByIdAndRemove(req.params.id)
				.then((wine) => {
					if (wine === null) {
						return Promise.reject("NOT_FOUND");
					}
					res.send({success: true});
					return next();
				}).catch((error) => {
					if (error === "NOT_FOUND") {
						return next(new errors.NotFoundError());
					}
					return next(error);
				});
		}
	};
}();
