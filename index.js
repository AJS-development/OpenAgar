var main = require('./source/core/controller.js')
 require('./cpu.js').init('./data')
var m = new main()
m.start()
