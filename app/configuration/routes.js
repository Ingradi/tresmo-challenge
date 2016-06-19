
module.exports = function (server) {
	'use strict';

	var wineController =  require("../controller/wine-controler");

	server.get('/wines', wineController.findWines);
	server.post('/wines', wineController.addWine);
	server.put('/wines/:id', wineController.modifyWine);
	server.get('/wines/:id', wineController.getWine);
	server.del('/wines/:id', wineController.deleteWine);
};
