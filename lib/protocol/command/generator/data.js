'use strict';

//'{"cmd":"data", "sender":"' + cur_uid + '","data":' + JSON.stringify(data) + '}'

module.exports = function(obj){
	let dataLen = obj.data.length;
	let bufferLen = 7 + dataLen;

	var buffer = new Buffer(bufferLen);

	buffer.writeInt8(bufferLen - 2, 1);
	buffer.writeInt32LE(Number(obj.sender), 2);
	buffer.writeInt8(dataLen, 6);

	buffer.write(obj.data, 7, dataLen, 'utf-8');

	return buffer;
}