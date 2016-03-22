'use strict'

module.exports = function (msg, obj) {
	obj["move"] = {
		x : msg.readFloatLE(1)
		,y : msg.readFloatLE(5)
	}

	obj["rotate"] = {
		x : msg.readFloatLE(9)
		,y : msg.readFloatLE(13)
	}
}