'use strict'

module.exports = function (msg, obj) {
	obj["unit"] = msg.readInt8(1)
}