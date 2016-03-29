'use strict'

let instance = null

class UIDMaker {
	constructor(pid) {
		if (!instance) {
			instance = this
		}

		this.already = new Set()

		return instance
	}

	make() {
		var roomNumber = 99999;

		while(roomNumber > 65535 || roomNumber < 10000 || this.already.has(roomNumber)) {
			roomNumber =  Math.floor(Math.random() * Math.pow(10, 5)) + 1;
		}

		this.already.add(roomNumber)
		return roomNumber;
	}

	remove(roomNumber) {
		this.already.delete(roomNumber)
	}
}

module.exports = UIDMaker