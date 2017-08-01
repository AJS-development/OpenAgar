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
    constructor(config, ban, skins, botnames) {
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
        this.botnames = botnames;
        this.nameList = botnames.slice(0)
        this.globalBan = {};
    }
    getNextId() {

        if (this.id >= 4294967295) this.id = 0;

        return this.id++;
    }
    getRandomName() {

        if (this.nameList.length === 0) this.nameList = this.botnames.slice(0)
        var index = Math.floor(Math.random() * this.nameList.length);

        var name = this.nameList[index];

        this.nameList.splice(index, 1);

        return name;
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
    updateGlobalBan(data) {
        this.globalBan = {};
        for (var i = 0; i < data.length; i++) {
            this.globalBan[data[i].ip] = data[i];
        }

    }
};
