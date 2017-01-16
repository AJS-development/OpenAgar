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


module.exports = class PlayerTemplate {
    constructor(id, server) {
        this.id = id;

        this.server = server;

        this.mouse = {
            x: 0,
            y: 0
        }
        this.center = {
            x: 0,
            y: 0
        }
        this.owning = new Map();
        this.mass = 0;
        this.frozen = false;

        this.score = 0;
        this.golden = false;
        this.gameData = {
            name: "",
            color: server.getRandomColor(),
            chatColor: server.getRandomColor(),
            reservedChatNames: [],
            chatName: "",
            chkDeath: false,
            chatBan: false,
            reservedNamesMap: []
        }

        this.bulletsleft = 3
        this.killer = false;


        this.minions = new Map();
        this.cells = new Map();


        this.alive = Date.now()

    }
    msg() {

    }
    setOwn(node) {
        this.owning.set(node.id, node)
    }
    removeOwn(node) {
        this.owning.delete(node.id)
    }
    addMinion(minion) {
        this.minions.set(minion.id, minion)

    }
    addCell(cell) {
        this.cells.set(cell.id, cell)
    }
    setMass(m) {
        this.cells.forEach((cell) => {
            cell.updateMass(m)
        })
    }
    removeMinion(minion) {
        this.minions.delete(minion.id)
    }
    reset() {
        this.minions.clear();
        this.cells.clear();
        this.visible = [];
        this.gameData = {
            name: "",
            color: this.server.getRandomColor(),
            chatColor: this.server.getRandomColor(),
            reservedChatNames: [],
            chatName: "",
            chkDeath: false,
            chatBan: false,
            reservedNamesMap: []
        }
        this.owning.clear()

        this.sendData = false;
    }

    setColor(color) {
        this.gameData.color = color
        this.cells.forEach((cell) => {
            cell.color = color
        })

    }
    setName(name) {
        this.gameData.name = name
        this.cells.forEach((cell) => {
            cell.name = name
            cell.updCode()
        })


    }
    onDeath() {
        this.mass = 0;
        this.score = 0;
        this.alive = this.server.timer.time;

        this.spawn()
    }
    removeCell(cell) {
        this.cells.delete(cell.id)

        if (this.cells.size == 0) this.onDeath(cell.killer)
    }


    getBiggest() {
        var cell = false;
        this.cells.forEach((c) => {
            if (!cell || c.mass > cell.mass) cell = c
        })
        return cell;
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
    deleteNodes(main) {

        this.socket.sendDelete(main.deleteR)
    }

}