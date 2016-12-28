"use strict"
/*
    OpenAgar - Open source web game
    Copyright (C) 2016 Andrew S

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var template = require('./template.js');
module.exports = class Experimental extends template {
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
