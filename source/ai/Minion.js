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

module.exports = class Minion {
    constructor(server, id, name, botid, parent) {
        this.id = id
        this.parent = parent
        this.botid = botid
        this.server = server;
        this.isBot = true;
        this.isMinion = true;
        this.mouse = this.parent.mouse

        this.center = {
            x: 0,
            y: 0
        }
        this.owning = new Map();
        this.mass = 0;
        this.timer = {
            changeDir: 0,
        }
        this.gameData = {
            name: name,
            color: server.getRandomColor(),
            chatname: "",
            reservedChatNames: [],
            chkDeath: false
        }
        this.score = 0;
        var t = new Date()
        this.alive = t.getTime()
        this.cells = new Map();
        this.removed = false;
        this.spawn()
    }
    setOwn(node) {
        this.owning.set(node.id, node)
    }
    removeOwn(node) {
        this.owning.delete(node.id)
    }

    onRemove(main) {
        this.parent.removeMinion(this)
        this.removed = true;
    }
    kick() {
        this.server.removeMinion(this)
    }

    addCell(cell) {
        this.cells.set(cell.id, cell)

    }

    onDeath() {
        this.mass = 0;
        this.score = 0;
        this.alive = this.server.timer.time;
        this.playing = false;
        this.spawn()
    }
    spawn() {
        if (this.playing || this.removed) return;


        this.server.spawn(this)

        this.playing = true;
        if (this.parent.pausem) this.frozen = true;
    }
    getScore(re) {

        if (re) {
            var l = 0;
            this.cells.forEach((n) => {
                l += n.mass;
            })
            this.mass = l;
            this.score = Math.max(this.score, l)
            return l
        }
        this.score = Math.max(this.score, this.mass)
        return this.score
    }

    setRandom() {
        if (!this.a) return;
        var a = this.a
        this.mouse.x = Math.floor(a.width * Math.random()) + a.x;
        this.mouse.y = Math.floor(a.height * Math.random()) + a.y
    }

    changeColor(color) {
        this.gameData.color = color
        this.cells.forEach((cell) => {
            cell.color = color
        })

    }
    changeName(name) {
        this.gameData.name = name
        this.cells.forEach((cell) => {
            cell.name = name
        })

    }
    removeCell(cell) {
        this.cells.delete(cell.id)
        if (this.cells.size == 0) this.onDeath()
    }

}