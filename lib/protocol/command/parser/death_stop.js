'use strict'

module.exports = function (msg, obj) {
	obj["altitude"] =  msg.readFloatLE(1)
	
}