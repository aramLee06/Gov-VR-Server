'use strict'

module.exports = function (msg, obj) {
	obj["uid"] = msg.readInt16LE(1)
}