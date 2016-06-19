var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var chai = require("chai");
var sinonChai = require("sinon-chai");

chai.use(sinonChai);

before(function(done) {
	if (mongoose.connection.db) {
		return done();
	}
	mongoose.connect('mongodb://localhost/wine-test', done);
});

after(function(done){
	mongoose.connection.db.dropDatabase(function() {
		mongoose.connection.db.close(function() {
			done();
		});
	});
});
