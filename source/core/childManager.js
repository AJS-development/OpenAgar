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

var Child = require('child_process')
var QuickMap = require('quickmap')
var ChildHolder = require('./childHolder.js')
module.exports = class childManager {
    constructor(ss) {
        this.ss = ss;
        this.cpus = require('os').cpus()
        this.childs = new QuickMap();
        this.cid = 0
        this.init()

    }
    debug(a) {
        this.ss.controller.shellService.log(0, a)
    }
    init() {
        this.debug("gre{[Debug]} Number of computer cores detected: ".styleMe() + this.cpus.length)
        if (this.cpus.length <= 1) throw "Your computer must have more than one core in order to run this program"
        process.on('exit', function () {
            var count = 0;
            this.childs.forEach((child) => {
                child.stop()
                count++;
            })
            this.debug("gre{[Debug]} Killed ".styleMe() + count + " processes")
            console.log("\ngre{[OpenAgar]} Killed all processes".styleMe())
        }.bind(this));
    }

    assignChild(sid) {
        if (this.childs.length < this.cpus.length - 1) {
            var child = this.createNewChild()
            child.assign(sid)
            this.debug("gre{[Debug]} Created new child (ID: ".styleMe() + child.id + ") and assigned server " + sid + " to it.")
            return child
        }
        var lowest = false;
        this.childs.forEach((child) => {
            if (!lowest || child.assigned < lowest.assigned) lowest = child

        })
        if (!lowest) throw "ERR: Child was not found"

        lowest.assign(sid)
        this.debug("gre{[Debug]} Assigned server ".styleMe() + sid + " to child (ID: " + lowest.id + " ASSIGNED: " + lowest.assigned + ")")
        return lowest

    }
    deAssignChild(id, sid) {
        var child = this.childs.get(id)
        if (!child) throw "ERR: Cannot deassign child that doesnt exsist!"

        child.deAssign(sid)
        this.debug("gre{[Debug]} Deassigned server ".styleMe() + sid + " to child (ID: " + child.id + " ASSIGNED: " + child.assigned + ")")
        if (child.assigned <= 0) {
            child.stop()
            this.childs.delete(id)
            this.debug("gre{[Debug]} Killed child (ID: ".styleMe() + id + ")")
        }

    }

    getNextCID() {
        return this.cid++;
    }
    createNewChild() {
        var child = Child.fork(__dirname + '/../child/index.js')
        var id = this.getNextCID()
        var data = new ChildHolder(id, child)
        this.childs.set(id, data)
        return data;
    }

}