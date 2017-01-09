"use strict";
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
module.exports = class MotherCell extends template {
    constructor(position, mass, type, owner, name) {
        super(position, mass, type, owner);

        this.color = {
            r: 190 + Math.floor(30 * Math.random()),
            g: 70 + Math.floor(30 * Math.random()),
            b: 85 + Math.floor(30 * Math.random())
        };

        this.type = 7;

        this.spiked = true;


    }
    feed(node, main) {

        node.eat(this, main)
    }

    getEatRange() {

        return this.size * 0.8;

    }
    collide(node, main) {
        if (node.mass < this.mass) {
            node.eat(this, main)
        } else if (node.mass > this.mass * 1.1) {
            var split = main.getConfig().playerMaxCells - node.owner.cells.size;
            if (split == 0) {
                node.addMass(this.mass)
            }
            var defaultmass = ~~(node.mass / (split + 2))
            var big = defaultmass * 2 + defaultmass / 2
            var medium = defaultmass / 2 + defaultmass
            var angle = (Math.random() * 6.28318530718) // Math.floor(Math.random() * max) + min
            node.updateMass(big)
            this.eat(node, main)

            // need to divide angle in order to spread them evenly
            // 360 degrees -> 2PI radians -> 6.28318530718
            var increment = 6.28318530718 / (split + 1) // want to add some randomness
            var g = ~~(split.length / 2)
            for (var i = 0; i < split; i++) {
                var mass = (i == 0) ? medium : defaultmass;
                var a = main.splitCell(node, angle, main.getConfig().splitSpeed, main.getConfig().splitDecay, mass)
                a.setMerge(main, main.getConfig().playerMerge, main.getConfig().playerMergeMult)
                main.getWorld().setFlags(a, "merge")
                main.getWorld().setFlags(node, "merge")
                angle += increment + (Math.random() * 0.03)
                if (angle > 6.28318530718) angle += -6.28318530718 // radians dims 0 < x < 2PI
            }
        }
    }
    update(main) {
        if (Math.random() > 0.971) {
            var maxFood = Math.random() * 2; // Max food spawned per tick
            var i = 0; // Food spawn counter
            while (i < maxFood) {

                this.spawnFood(main);


                // Increment
                i++;
            }
        }

        if (this.mass > 222) {


            var remaining = this.mass - 222;
            var maxAmount = Math.min(Math.floor(remaining / 2), 2);
            for (var i = 0; i < maxAmount; i++) {
                this.spawnFood(main);
                this.addMass(-2);
            }
        }
    }
    spawnFood(main) {

        if (main.food >= main.getConfig().maxFood) return
        var angle = Math.random() * 6.28;
        var pos = {
            x: this.position.x + (this.size * Math.cos(angle)),
            y: this.position.y + (this.size * Math.sin(angle))
        };
        var food = main.addNode(pos, 2, 4, false, false, "m");
        food.setEngine1(angle, 20, (Math.random() * 4) + 4)

    }
    move(main, sp) {

        // dont move

    }
};
