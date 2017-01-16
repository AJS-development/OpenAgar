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

module.exports = class FakePlayer extends Template {
    constructor(server, id, name, botid) {
        super(id, server)

        this.botid = botid

        this.isBot = true;
        this.gameData = {
            name: name,
            color: server.getRandomColor(),
            chatname: "",
            reservedChatNames: [],
            chkDeath: false
        }

        server.spawn(this)
    }
    onRemove(main) {

  }

    kick() {
        this.server.removeBot(this)
    }

    onDeath() {
        this.mass = 0;
        this.score = 0;
    }
    onSpawn() {
        this.alive = this.server.timer.time;
    }

}