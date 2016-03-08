var test = require("./SingleTone.js");

exports.func = function() {
	var cl = new test();

	cl.add("test2222", "value!2");

	return cl;
}