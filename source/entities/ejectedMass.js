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
module.exports = class EjectedMass extends template {
    constructor(position, mass, type, owner, other) {
        super(position, mass, type, owner, other);
        this.color = owner.gameData.color
        this.type = 3;
        this.viruses = [];
        this.up = false
        this.own = owner

    }
    onDeletion(main) {
        this.own.removeOwn(this)
    }
    onCreation(main) {
        this.own.setOwn(this)
    }
    move(main, speed) { // Speed code: 0 = 0.05, 1 = 0.1, 2 = 0.2
        if (this.moveEngine2.useEngine) this.calcMove2(main, speed)
        if (this.moveEngine.useEngine) this.calcMove(main, speed)


        this.checkGameBorders(main)

        main.updateHash(this)
        this.checkVirus(main)
        this.movCode()

    }
    checkVirus(main) {
        this.up = !this.up
        if (this.up)


            main.getWorld().getNodes('hash').every(this.bounds, (node) => {

            if (node.type == 2) {

                if (!node.collisionCheckCircle(this, true)) return true;
                node.feed(this, main)

                return false;
            } else
            if (node.type == 5) {
                if (!node.collisionCheckCircle(this)) return true;
                node.feed(this, main)
                return false;
            } else
            if (node.type == 0) {
                if (!node.collisionCheckCircle(this)) return true;
                this.eat(node, main)
                return false;
            } else if (node.type == 6) {

                if (!node.collisionCheckCircle(this)) return true;
                node.feed(this, main);
                return false;
            } else if (main.feedListeners[node.type]) {
                if (!node.collisionCheckCircle(this)) return true;
                node.feed(this, main)
                return false;
            }

            return true;

        })
    }
};