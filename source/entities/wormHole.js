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
module.exports = class wormhole extends template {
    constructor(position, mass, type, owner, name) {
        super(position, mass, type, owner);

        this.color = {
            r: 0,
            g: 0,
            b: 0
        }
        this.okay = [];

        this.agit = true;
        this.type = 6;


        this.nearby = [];


    }
    feed(node, main) {
        this.teleport(node, main)
    }
    onDeletion(main) {
        main.wormHoles--;
    }
    onCreation(main) {
        main.wormHoles++;
    }
    getEatRange(node) {

        if (node.mass > this.mass) {
            return this.size * -0.4;
        } else {
            return this.size - node.size;
        }

    }
    tpa(node, main) {

        node.position.x = this.position.x
        node.position.y = this.position.y
        this.okay[node.id] = true;
        setTimeout(function () {
            this.okay[node.id] = false
        }.bind(this), 5000)

    }
    teleport(node, main) {
        var a = main.getWorld().getNodes('wormhole').toArray()

        a = a[Math.floor(Math.random() * a.length)]

        if (a) {
            a.tpa(node, main)
        }
    }
    explode(node, main) {
        var split = main.getConfig().playerMaxCells - node.owner.cells.size;

        var defaultmass = ~~(node.mass / (split + 7))
        var big = defaultmass * 3
        var medium = defaultmass / 2 + defaultmass * 2
        var angle = (Math.random() * 6.28318530718) // Math.floor(Math.random() * max) + min
        node.updateMass(big)
        this.eat(node, main)

        // need to divide angle in order to spread them evenly
        // 360 degrees -> 2PI radians -> 6.28318530718
        var increment = 6.28318530718 / (split + 1) // want to add some randomness
        var g = ~~(split.length / 2)
        for (var i = 0; i < split + 3; i++) {
            var mass = (i == 0) ? medium : defaultmass;
            var a = main.splitCell(node, angle, main.getConfig().splitSpeed, main.getConfig().splitDecay, mass)
            a.setMerge(main, main.getConfig().playerMerge, main.getConfig().playerMergeMult)
            main.getWorld().setFlags(a, "merge")
            main.getWorld().setFlags(node, "merge")
            angle += increment + (Math.random() * 0.03)
            if (angle > 6.28318530718) angle += -6.28318530718 // radians dims 0 < x < 2PI
        }
    }
    collide(node, main) {

        if (this.okay[node.id]) return;
        if (node.mass > this.mass) {
            var random = Math.random() * 100
            if (random <= 50) {

            } else if (random <= 80) {

                this.explode(node, main)
                return;
            } else {
                this.okay[node.id] = true;
                setTimeout(function () {
                    this.okay[node.id] = false
                }.bind(this), 30000)
                return;
            }
        }

        if (node.owner.cells.size == 1) {
            this.teleport(node, main)
        } else {
            node.owner.cells.forEach((cell) => {
                if (cell == node) return;
                main.removeNode(cell)

            })

            this.teleport(node, main)

        }

    }

};