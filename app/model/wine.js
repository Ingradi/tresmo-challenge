"use strict";

module.exports = function() {
	var mongoose = require("mongoose");
	var autoIncrement = require("mongoose-sequence");
	var WineQuery = require("./wine-query");
	var Schema = require("mongoose").Schema;

	var wineTypes = ["red", "white", "rose"];

	var wineSchema = new Schema({
		_id: Number,
		name: {
			type: String,
			required: true
		},
		year: {
			type: Number,
			required: true,
			min: 1
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
	wineSchema.set("toObject", { getters: true, virtuals: false, transform: function (doc, ret) {
		ret.id = ret._id;
		delete ret._id;
		delete ret.__v;
	}});

	wineSchema.statics.query = function () {
		return new WineQuery(this.model("wine"));
	};

	wineSchema.methods.updateWith = function (modifications) {
		if (!modifications || Object.keys(modifications).length === 0) {
			return Promise.resolve(this);
		}
		var item = this;
		Object.keys(modifications).forEach((key) => item[key] = modifications[key]);
		return this.save();
	};

	return mongoose.model("wine", wineSchema);
}();
