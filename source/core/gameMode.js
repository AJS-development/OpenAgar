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
var ingame = require('../modes/index.js')
module.exports = class gameModeHandler {
    constructor(main) {
        this.main = main;
        this.mode = false;
        this.init()
    }
    init() {
        this.setMode(this.main.getConfig().gameMode)


        this.event('onServerInit')
        this.main.log("gre{[OpenAgar]} Current gamemode is ".styleMe() + this.main.getConfig().gameMode + " (" + this.mode.name + ")")
    }
    setMode(mode) {
        this.mode = ingame.get(mode)
        if (!this.mode) this.mode = this.main.pluginService.gamemodes[mode]
        if (!this.mode) throw "ERROR: Invalid gamemode! Gamemode doesnt exsist"
    }
    event(event, data) {
        if (!data) data = {}
        if (!this.mode) return true;
        if (!this.mode[event]) return true;
        data.main = this.main;
        data.log = this.main.log
        if (this.mode[event](data) === false) return false
        return true;
    }

}