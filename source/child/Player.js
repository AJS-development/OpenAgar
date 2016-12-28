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
module.exports = class Bot {
    constructor(id, server) {
        this.id = id
        this.team = 0;
        this.score = 0;
        this.mouse = {
            x: 0,
            y: 0
        }
        this.center = {
            x: 0,
            y: 0
        }

        this.server = server;
        this.cells = [];

    }
    onRemove(main) {
        this.cells.forEach((cell) => {
            main.removeNode(cell)
        })
    }
    addCell(cell) {

        if (this.cells.indexOf(cell) != -1) return;
        this.cells.push(cell)

    }

    onDeath() {


    }
    spawn() {

        this.server.spawn(this)

    }
    getScore(re) {
        if (this.cells.length == 0) return 0;

        var l = 0;
        this.cells.forEach((n) => {
            l += n.mass;
        })
        this.mass = l;
        this.score = Math.max(this.score, l)
        return this.score

    }

    getRandom() {
        if (!this.a) return;
        var a = this.a
        return {
            x: Math.floor(a.width * Math.random()) + a.x,
            y: Math.floor(a.height * Math.random()) + a.y
        }

    }

    calcView() {
        if (this.cells.length == 0) return
        var totalSize = 1.0;
        var x = 0,
            y = 0;
        // console.log(this.cells)
        this.cells.forEach((cell) => {

            if (!cell) return
            x += cell.position.x
            y += cell.position.y
            totalSize += cell.getSize();
        })
        this.center.x = x / this.cells.length
        this.center.y = y / this.cells.length
        var factor = Math.pow(Math.min(64.0 / totalSize, 1), 0.4);
        this.sightRangeX = this.server.getConfig().serverViewBaseX / factor;
        this.sightRangeY = this.server.getConfig().serverViewBaseY / factor;
        this.a = {
            x: this.center.x - this.sightRangeX,
            y: this.center.y - this.sightRangeY,
            height: 2 * this.sightRangeY,
            width: 2 * this.sightRangeX
        }
        return this.a
    }

    changeColor(color) {


    }
    changeName(name) {


    }
    removeCell(cell) {
        var ind = this.cells.indexOf(cell)
        if (ind != -1) this.cells.splice(ind, 1)
            // console.log(this.cells.length)
        if (this.cells.length == 0) return this.onDeath()
    }

}