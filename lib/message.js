'use strict'

var fs = require('fs');
var CommandNumber = require(__dirname + "/../config/commandCode.json").client2server;

let command = {}

function Init(){
	for(var key in CommandNumber){
		var val = CommandNumber[key];
		command[val.cmd] = require("./command/" + val.cmd + ".js");
	}
}

exports.process = function(socket, data){
	//console.log("Start Process" , data.cmd)
	if(typeof command[data.cmd] !== 'undefined'){
		return command[data.cmd](socket, data)
	} else {
		console.log("Invalid Command ->", data.cmd )
	}
}

Init()