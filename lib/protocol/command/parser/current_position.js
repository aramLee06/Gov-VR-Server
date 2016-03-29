'use strict'

module.exports = function (msg, obj) {
	obj["move"] = {
		x : msg.readFloatLE(1)
		,y : msg.readFloatLE(5)
		,z : msg.readFloatLE(9)
	}

	obj["rotate"] = {
		x : msg.readFloatLE(13)
		,y : msg.readFloatLE(17)
		,z : msg.readFloatLE(21)
	}

	obj["current"] = {
		x : msg.readFloatLE(25)
		,y : msg.readFloatLE(29)
		,z : msg.readFloatLE(33)
	}
}