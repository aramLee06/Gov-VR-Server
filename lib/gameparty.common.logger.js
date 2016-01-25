var log = require('sm-log');
var d = new Date();
var print_log = function(msg) { log.i(msg); }
exports.e = function(msg) { log.e(d.toISOString() + "{E} " + msg); }		
exports.w = function(msg) { log.w(d.toISOString() + "(W) " + msg); }		
exports.i = function(msg) { log.i(d.toISOString() + "[I] " + msg); }		
exports.s = function(msg) { log.t(d.toISOString() + "[S] " + msg); }		
