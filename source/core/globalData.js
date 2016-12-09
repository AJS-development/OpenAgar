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
module.exports = class GlobalData {
    constructor(config, ban, skins) {
        this.data = {};
        var fin = {};
        var id = -1
        var f = [];
        for (var i in skins) {
            fin[i] = {
                skin: skins[i],
                id: id
            }
            f[id--] = skins[i]
        }

        this.skins = fin;
        this.skins2 = f
        this.config = config;
        this.id = 1;
        this.ban = ban
    }
    getNextId() {
        return this.id++;
    }

    getData() {
        return this.data;
    }
    addData(name, value) {
        this.data[name] = value;
    }
    removeData(name) {
        this.data[name] = null;
    }
};