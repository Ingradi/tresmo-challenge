
module.exports = function () {
	var clean = function(data) {
		if (!data) {
			return data;
		}
		var stringified = JSON.stringify(data);
		return JSON.parse(stringified.replace(/\$/g, ""));
	};

	return (req, res, next) => {
		if (req.body) {
			req.body = clean(req.body);
		}
		if (req.query) {
			req.query = clean(req.query);
		}
		if (req.params) {
			req.params = clean(req.params);
		}
		next();
	}
};
