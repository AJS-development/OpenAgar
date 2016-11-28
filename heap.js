

var fs = require('fs');
var profiler = require('heapdump');
var _datadir = null;

var startProfiling = function() {
    var stamp = Date.now();
    var id = 'profile-' + stamp;

    // Use stdout directly to bypass eventloop
    fs.writeSync(1, 'Start profiler with Id [' + id + ']\n');

    // Start profiling
    profiler.writeSnapshot(_datadir + '/' + id + '.heapsnapshot',function() {
        console.log("Done profiling")
          setTimeout(function () {
startProfiling()
    }, 5000);
    });



  
}

module.exports.init = function (datadir) {
    _datadir = datadir;
    startProfiling()
};
