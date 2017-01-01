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

module.exports = class ChildHolder {
    constructor(id, child) {
        this.id = id;
        this.child = child;
        this.listeners = [];
        this.assigned = 0;
        this.init()
    }
    _send(data) {
        this.child.send(data)
    }
    init() {
        this.child.on('message', function (msg) {
            if (this.listeners[msg.id]) this.listeners[msg.id](msg.data)
        }.bind(this))
    }
    send(id, data) {
        data.sid = id;
        try {

            this._send(data)

        } catch (e) {

        }

    }
    removeListener(id) {
        delete this.listeners[id]
    }
    assign(sid) {

        this.assigned++;
        this._send({
            type: 8,
            a: sid
        })
    }
    deAssign(sid) {
        this.assigned--;
    }
    stop() {
        this._send({
            type: 6
        })
        delete this.child

    }
    on(id, func) {
        this.listeners[id] = func
    }
}