var test = require("./SingleTone.js");

exports.func = function() {
	var cl = new test();

	cl.add("test", "value!");

	return cl;
}