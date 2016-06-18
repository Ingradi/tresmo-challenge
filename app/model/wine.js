module.exports = function() {
	'use strict';

	var mongoose = require('mongoose');
	var autoIncrement = require('mongoose-sequence');
	var WineQuery = require("./wine-query");
	var Schema = require('mongoose').Schema;

	var wineTypes = ["red", "white", "rose"];

	var wineSchema = new Schema({
		_id: Number,
		name: {
			type: String,
			required: true
		},
		year: {
			type: Number,
			required: true
		},
		country: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true,
			enum: wineTypes
		},
		description: {
			type: String
		}
	}, { _id: false });

	wineSchema.plugin(autoIncrement);
	wineSchema.set('toObject', { getters: true, virtuals: false, transform: function (doc, ret, options) {
		ret.id = ret._id;
		delete ret._id;
		delete ret.__v;
	}});

	wineSchema.statics.query = function () {
		return new WineQuery(this.model('wine'));
	};

	return mongoose.model('wine', wineSchema);
}();
