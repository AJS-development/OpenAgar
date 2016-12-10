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
module.exports = class bullet extends template {
    constructor(position, mass, type, owner, name) {
        super(position, mass, type, owner);
        if (this.owner.golden) {
            this.golden = true;
            this.color = {
                r: 200,
                g: 200,
                b: 20
            }
        } else {
            this.golden = false;
            this.color = {
                r: 200,
                g: 200,
                b: 200
            }
        }
        this.fed = 0;
        this.type = 5;

        this.agit = true;
        this.nearby = [];
        owner.setOwn(this)

    }
    moveDone(main, method) {

        if (!this.moveEngine.useEngine && !this.moveEngine2.useEngine) main.removeNode(this)

    }
    feed(node, main) {

        var m1 = 4;
        var m2 = 100;
        var v1 = node.moveEngine.velocity;
        var v2 = this.moveEngine.velocity;
        var angle1 = node.moveEngine.angle;
        var angle2 = this.moveEngine.angle;

        var px = m1 * v1 * Math.cos(angle1) + m2 * v2 * Math.cos(angle1);
        var py = m1 * v1 * Math.sin(angle2) + m2 * v2 * Math.sin(angle2);

        var angle = Math.atan2(py, px);



        this.moveEngine.angle = angle;
        this.moveEngine.cos = Math.cos(angle)
        this.moveEngine.sin = Math.sin(angle)
        this.moveEngine.deltaT = 0;

        main.removeNode(node)
    }
    doesCollide(node, main) {
        return true;

    }

    onDeletion(main) {
        this.own.removeOwn(this)
    }
    onCreation(main) {
        this.own.setOwn(this)
    }
    getEatRange() {

        return this.size * -0.5;

    }
    explodeCell(node, main) {


        while (node.mass > 10) {
            node.addMass(-main.getConfig().ejectedMass);
            var pos = {
                x: node.position.x + Math.floor(Math.random() * 1000) - 500,
                y: node.position.y + Math.floor(Math.random() * 1000) - 500

            }
            var ejected = main.addNode(pos, main.getConfig().ejectedMass, 3, node.owner, [], "m")
            ejected.setEngine1(6.28 * Math.random(), main.getConfig().ejectedSpeed, main.getConfig().ejectedDecay)
            ejected.setCurve(10)



        }


    }
    collide(node, main) {
        if (this.owner == node.owner || node.owner.mass <= 500) {

            this.eat(node, main)
            node.addMass(2)
            node.owner.bulletsleft++;
            return;
        }
        if (this.golden) {
            this.explodeCell(node, main)
            return
        }
        var split = main.getConfig().playerMaxCells - node.owner.cells.length;

        var defaultmass = ~~(node.mass / (split + 15))
        var big = defaultmass * 3
        var medium = defaultmass / 2 + defaultmass * 2
        var angle = (Math.random() * 6.28318530718) // Math.floor(Math.random() * max) + min
        node.updateMass(big)
        this.eat(node, main)

        // need to divide angle in order to spread them evenly
        // 360 degrees -> 2PI radians -> 6.28318530718
        var increment = 6.28318530718 / (split + 1) // want to add some randomness
        var g = ~~(split.length / 2)
        for (var i = 0; i < split + 10; i++) {
            var mass = (i == 0) ? medium : defaultmass;
            var a = main.splitCell(node, angle, main.getConfig().splitSpeed, main.getConfig().splitDecay, mass)
            main.getWorld().setFlags(a, "merge")
            main.getWorld().setFlags(node, "merge")
            angle += increment + (Math.random() * 0.03)
            if (angle > 6.28318530718) angle += -6.28318530718 // radians dims 0 < x < 2PI
        }

    }

};