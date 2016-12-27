"use strict"
module.exports = {
    modes: [require('./FFA.js'), require('./Teams.js'), require('./Experimental.js'), require('./Minions.js')],
    get: function (id) {
        var a = new this.modes[id]()
        return a;
    },

}