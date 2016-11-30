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
module.exports = class FoodService {
    constructor(main) {
        this.main = main;
    }
    checkFood() {
        // console.log(this.main.dataService.world.nodes.getWithMerged(this.main.bounds).length)
        if (this.main.food < this.main.getConfig().minFood) {
            this.addFood(this.main.getConfig().minFood - this.main.food);
        } else {
            // console.log(this.main.dataService.world.getNodes())
        }

    }
    getRandomPos() {
        var x = Math.floor(this.main.bounds.width * Math.random());
        var y = Math.floor(Math.random() * this.main.bounds.height);
        return {
            x: x,
            y: y
        };
    }
    addFood(m) {
        for (var i = 0; i < m; i++) {
            var pos = this.getRandomPos();
            // console.log(pos)
            this.main.addNode(pos, 2, 4);
        }
    }
    checkVirus() {
        if (this.main.viruses < this.main.getConfig().minVirus) {
            this.addVirus(this.main.getConfig().minVirus - this.main.viruses);
        } else {
            // console.log(this.main.dataService.world.getNodes())
        }
    }
    addWormHole(m) {
        for (var i = 0; i < m; i++) {
            var pos = this.getRandomPos();
            // console.log(pos)
            var mass = Math.floor(Math.random() * 500) + 100
            this.main.addNode(pos, mass, 6);
        }
    }
    checkWormHole() {
        if (this.main.wormHoles < this.main.getConfig().minWormHole) {
            this.addWormHole(this.main.getConfig().minWormHole - this.main.wormHoles);
        } else {
            // console.log(this.main.dataService.world.getNodes())
        }
    }
    addVirus(m) {

        for (var i = 0; i < m; i++) {
            var pos = this.getRandomPos();
            // console.log(pos)
            this.main.addNode(pos, this.main.getConfig().virusMass, 2);
        }
    }
};