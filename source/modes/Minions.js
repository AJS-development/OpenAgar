"use strict"
var template = require('./template.js');
module.exports = class Minions extends template {
    constructor() {
        super()
        this.id = 3;
        this.name = "Minions";

    }
    onPlayerInit(data) {

        var num = 5,
            player = data.player,
            main = data.main;
        main.addMinions(player, num);
    }


}