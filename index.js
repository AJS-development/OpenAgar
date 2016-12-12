var main = require('./source/core/controller.js')
    // require('./cpu.js').init('./data')
    // require('./heap.js').init('./data')
Map.prototype.toArray = function () {
    var array = [];
    this.forEach(function (a) {
        array.push(a)
    })
    return array
}
var m = new main()
m.start()