'use strict'

module.exports = function (msg, obj) {
	obj["position"] = {
		x : msg.readFloatLE(1)
		,y : msg.readFloatLE(5)
		,z : msg.readFloatLE(9)
	}

	obj["velocity"] = {
		x : msg.readFloatLE(13)
		,y : msg.readFloatLE(17)
		,z : msg.readFloatLE(21)	
	}
}