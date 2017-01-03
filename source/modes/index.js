"use strict"
module.exports = {
    modes: [require('./FFA.js'), require('./Teams.js'), require('./Experimental.js'), require('./Minions.js'), require('./HideNSeek.js')],
    get: function (id) {
        if (!this.modes[id]) return false;
        var a = new this.modes[id]()
        return a;
    },

}