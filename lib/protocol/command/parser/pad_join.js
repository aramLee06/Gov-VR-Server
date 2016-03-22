module.exports = function(msg, obj){
	obj["uid"] = msg.readUInt16LE(1);
	obj["target"] = msg.readUInt16LE(3);
}