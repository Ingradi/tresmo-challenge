
module.exports = function(model) {
	'use strict';
	return {
		query: {},
		byName: function (name) {
			if (name && name.length > 0) {
				Object.assign(this.query, {name: {"$regex": name}});
			}
			return this;
		},
		byCountry: function (country) {
			if (country && country.length > 0) {
				Object.assign(this.query, {country: country});
			}
			return this;
		},
		byYear: function (year) {
			if (!year || isNaN(year)) {
				return this;
			}
			Object.assign(this.query, {year: parseInt(year)});
			return this;
		},
		byType: function (type) {
			if (type && type.length > 0) {
				Object.assign(this.query, {type: type});
			}
			return this;
		},
		find: function(cb) {
			return model.find(this.query, cb);
		}
	};
};
