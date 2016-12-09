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
module.exports = class SkinHandler {
    constructor(player) {
        this.player = player
        this.skin = "";
        this.sentHash = {};

    }
    getSkin(name) {
        if (name.charAt(0) == "<") {
            var a = name.indexOf(">")
            if (a == -1) return;
            var skin = name.substr(1, a)
            if (!skin) return;
            var b = this.player.globalData.skins[skin.toLowerCase()];
            if (!b) return;
            this.skin = b.id;
        }
    }
    getSend(skin) {
        if (skin <= 200 || this.sentHash[skin]) {
            return skin;
        } else {
            if (this.player.globalData[skin]) {
                return "!" + skin + "|" + this.player.globalData[skin]
                this.sentHash[skin] = true
            } else {
                return -1
            }
        }
    }


}