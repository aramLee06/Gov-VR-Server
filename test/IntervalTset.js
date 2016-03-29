'use strict'

let count = 0
let interval = setInterval(() => {
	process.nextTick(() => {
		console.log(count++)

		if(count == 10)
			clearInterval(interval);
	});
}, 1000);


let interval2 = setInterval(() => {
	process.nextTick(() => {
		console.log("BK :", count)

		if(count == 10)
			clearInterval(interval2);
	});
}, 1000);

