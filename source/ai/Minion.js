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
var Template = require('../core/PlayerTemplate.js');

module.exports = class Minion extends Template {
    constructor(server, id, name, botid, parent) {
        super(id, server)
        this.parent = parent
        this.botid = botid
        this.isBot = true;
        this.isMinion = true;
        this.mouse = this.parent.mouse

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

        this.spawn()
    }


    onRemove(main) {
        this.parent.removeMinion(this)
        this.removed = true;
    }
    kick() {
        this.server.removeMinion(this)
    }



    spawn() {
        if (this.cells.size > 0 || this.removed) return;


        this.server.spawn(this)


        if (this.parent.pausem) this.frozen = true;
    }


    setRandom() {
        if (!this.a) return;
        var a = this.a
        this.mouse.x = Math.floor(a.width * Math.random()) + a.x;
        this.mouse.y = Math.floor(a.height * Math.random()) + a.y
    }



}