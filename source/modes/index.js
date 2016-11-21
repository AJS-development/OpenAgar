"use strict"
module.exports = {
    modes: [require('./FFA.js')],
    get: function(id) {
       var a = new this.modes[id]()
       return a;
    },
    
}
