'use strict'

class Socket{
	constructor(name){
		this.name = name
	}

	write(msg){
		console.log([this.name, "- Write :", msg].join(" "));
	}
}

module.exports = Socket