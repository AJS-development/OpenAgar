"use strict"
var Virus = require('../entities/Virus.js');
var template = require('./template.js');
module.exports = class FFA extends template {
    constructor() {
        super()
        this.id = 2;
        this.name = "Experimental";

    }
    onServerInit(data) {
            var main = data.main;
            main.addEntityType(7, "mother", require('../entities/MotherCell.js')); // add the mothercell entity. Type = 7, AccessName = "mother".
            main.addCollisionListener(7); // Add a player collision listener
            main.addFeedListener(7); // Add a ejected mass feed listener

            main.override("virus", "feed", function (node, main) {
                main.setFlags(this, "m")
                this.setEngine1(node.moveEngine.angle, 50, 2)

                main.removeNode(node);
            })

            main.addGenerationLoop(20, 7, "mother", 222) // set generation of mothercells. 20 mothercells min.
        } // override

    onTick(data) {
        data.main.getWorld().getNodes('mother').forEach((m) => {
            m.update(data.main);
        })
    }

}