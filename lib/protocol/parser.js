'use strict';

var fs = require('fs');
var CommandNumber = require(__dirname + "/../../config/commandCode.json").client2server;

var parserList = {};

function Init(){
	for(var key in CommandNumber){
		var val = CommandNumber[key];
		parserList[val.cmd] = require("./command/parser/" + val.cmd + ".js");
	}
}

function parseData(cmd){
	return parserList[cmd];
}

function getCmdObj(cmd){
	return CommandNumber[cmd];
}

module.exports = function(buffer){
	let cmdObj = getCmdObj(buffer.readInt8(0))
	let msg = buffer.slice(0, cmdObj.len)
	
	let obj = {
		cmd : cmdObj.cmd
	}

	parseData(cmdObj.cmd)(msg, obj)

	return {
		"next" : buffer.slice(cmdObj.len)
		,data : obj
	}
}

Init();