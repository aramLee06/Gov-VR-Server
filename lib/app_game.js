var cluster 	  = require('cluster');
var log 		  = require('./gameparty.common.logger');
var gameConnector = require('./gameparty.core.connector');

/* global global */ 
global.domain 	  = require('domain').create();
global.delimiter1 = String.fromCharCode(232);
global.delimiter2 = String.fromCharCode(233);
/* global config */
global.config = require('../config/config.json');

// Exception Handler 등록
/* global process */
process.on('uncaughtException', function (err) {
	log.e('Caught exception: ' + err);
	log.w('err.stack : ' + err.stack);
});

// Game Server Start
var port = config.game.port || 7000;
gameConnector.startGamepartyServer(port);