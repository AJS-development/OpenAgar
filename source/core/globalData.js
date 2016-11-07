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
    constructor(config) {
        this.data = {};
        this.config = config;
          this.id = 0;
    }
    getNextId() {
        return this.id ++;
    }
    getData() {
        return this.data;
    }
    addData(name,value) {
        this.data[name] = value;
    }
    removeData(name) {
        this.data[name] = null;
    }
};
