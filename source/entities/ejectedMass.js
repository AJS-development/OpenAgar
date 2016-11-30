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
        owner.owning.push(this)
    }
    move(main, speed) { // Speed code: 0 = 0.05, 1 = 0.1, 2 = 0.2
        if (this.moveEngine2.useEngine) this.calcMove2(main, speed)
        if (this.moveEngine.useEngine) this.calcMove(main, speed)


        this.checkGameBorders(main)
        this.checkVirus(main)
        main.updateHash(this)

        this.movCode()

    }
    checkVirus(main) {
        this.up = !this.up
        if (this.up)
            this.viruses = main.getWorld().getNodes('hash').getNodes(this.bounds)

        this.viruses.every((virus) => {
            if (virus.type == 2) {

                if (!virus.collisionCheckCircle(this, true)) return true;
                virus.feed(this, main)

                return false
            } else
            if (virus.type == 5) {
                virus.feed(this, main)
            } else
            if (virus.type == 0) {
                if (!virus.collisionCheckCircle(this)) return true;
                this.eat(virus, main)
                return false;
            }

            return true;

        })
    }
};