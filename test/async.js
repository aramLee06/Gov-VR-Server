var async = require("async")

var count = 0;

async.during(
    function (callback) {
        console.log(count)
      return callback(null, count < 5);
    },
    function (callback) {
        console.log("FN : ",count)
        count++;
        setTimeout(callback, 1000);
    },
    function (err) {
        // 5 seconds have passed
    }
);