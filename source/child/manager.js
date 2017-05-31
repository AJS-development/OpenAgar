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
var HashBounds = require('../modules/HashBounds.js')
var Node = require('./node.js')
var Bot = require('../ai/Bot.js')
var Player = require('./Player.js')
var TooBusy = require('toobusy-js')




module.exports = class Manager {
    constructor(id) {
        this.id = id;
        this.addedHash = [];

        this.lagDel = false;
        this.toSend = [];
        this.map = new Map()
        this.bots = new Map()
        this.config = {};
        this.s = false;

        this.haveTeams = false;
        this.paused = false;
        this.events = {}
        this.bounds;
        this.timers = {
            a: 0,
            b: 0,
            c: 0
        }
        this.lag = false
        this.players = new Map();
        setInterval(function () {
            var lag = TooBusy.lag();
            this.lag = lag > 150
            if (this.lag) this.emit("lag", lag)
        }.bind(this), 4000)
    }
    addNodes(nodes) {

        nodes.forEach((node) => {

            if (this.addedHash[node.id]) {

                var n = this.map.get(node.id)
                n.set(node)
                this.nodes.update(n)
                return;

            };

            this.addedHash[node.id] = true;
            var owner = false
            if (node.owner && node.type == 0) {
                owner = this.bots.get(node.owner)
                if (!owner) {
                    owner = this.players.get(node.owner)
                    if (!owner) {
                        owner = new Player(node.owner, this)
                        this.players.set(node.owner, owner)
                    }
                }

            }


            var n = new Node(node, owner)
            n.bounds = {
                x: n.position.x - n.size,
                y: n.position.y - n.size,
                width: n.size * 2,
                height: n.size * 2
            }
            this.nodes.insert(n)
            this.map.set(node.id, n)

        })
    }
    pause(msg) {
        this.paused = msg.p
    }
    updateLB() {
        var players = [];

        function insert(pl) {
            if (!pl.cells.length) return;
            pl.getScore()
            if (!pl.mass) return;
            players.push({
                i: pl.id,
                m: pl.mass
            })
        }

        this.bots.forEach((bot) => {
            insert(bot)
        })
        this.players.forEach((player) => {
            insert(player)

        })

        var amount = this.getConfig().leaderBoardLen;

        var lb = players.sort(function (a, b) {
            return b.m - a.m;
        }).slice(0, amount);

        return lb;
    }

    spawn(bot) {
        this.toSend.push({
            id: bot.id,
            action: 1
        })

    }
    ejectMass(bot) {
        this.toSend.push({
            id: bot.id,
            action: 2
        })
    }
    splitPlayer(bot) {
        this.toSend.push({
            id: bot.id,
            action: 3
        })
    }
    removeNode(node) {
        node.destroyed = true;
        node.dead = true;
        this.nodes.delete(node)
        this.map.delete(node.id)
        this.addedHash[node.id] = false;
        node.onDelete(this)
    }

    removeNodes(nodes) {
        nodes.forEach((node) => {
            var n = this.map.get(node.id)
            if (n) this.removeNode(n)
        })

    }
    asign() {

    }
    getConfig() {
        return this.config
    }
    moveCode(nodes) {

        nodes.forEach((node) => {
            var n = this.map.get(node.id)
            if (n) {

                n.position.x = node.x
                n.position.y = node.y
                n.bounds = {
                    x: n.position.x - n.size,
                    y: n.position.y - n.size,
                    width: n.size * 2,
                    height: n.size * 2
                }
                this.nodes.update(n)
            }
        })
    }
    getRandomPos() {
        var x = Math.floor(this.bounds.width * Math.random());
        var y = Math.floor(Math.random() * this.bounds.height);
        return {
            x: x,
            y: y
        };
    }
    init(msg) {

        this.config = msg.config;
        this.haveTeams = msg.teams;
        this.bounds = msg.bounds;
        this.nodes = new HashBounds(5, 4, Math.max(this.bounds.width, this.bounds.height) + 700, 700); // 64 min
        try {

            clearInterval(this.interval)
        } catch (e) {

        }
        this.interval = setInterval(function () {
            if (this.paused) return;
            this.loop()
        }.bind(this), 50)
        this.slowInt = setInterval(function () {
            this.slowLoop()
        }.bind(this), 5000)
        this.on('delPlayer', function (ps) {

            this.removeClient(ps)


        }.bind(this))
    }
    onRemove() {
        try {
            clearInterval(this.interval)
        } catch (e) {

        }
        try {
            clearInterval(this.slowInt)
        } catch (e) {

        }
        this.bots.forEach((b) => {
            b.onRemove(this)
        })
        this.players.forEach((b) => {
            b.onRemove(this)
        })
        this.addedHash = false;
        this.nodes = false
        this.toSend = false;
        this.map = false
        this.bots = false
        this.config = false;
        this.s = false;
        this.haveTeams = false;
        this.events = false
        this.timers = false
        this.players = false

    }

    removeClient(id) {
        var a = this.bots.get(id)
        if (a) {
            this.bots.delete(id)
            a.onRemove(this)
            return;
        }
        var a = this.players.get(id)
        if (a) {
            this.players.delete(id)
            a.onRemove(this)
            return;
        }
    }
    addBot(id, bot) {
        this.bots.set(id, new Bot(id, this, bot))
    }
    emit(event, data) {
        var a = {
            e: event,
            d: data
        }
        this.toSend.push(a)
    }
    event(msg) {
        var e = msg.e
        var d = msg.d
        if (this.events[e]) this.events[e](d)
    }
    on(e, f) {

        this.events[e] = f
    }
    clearEvents() {
        this.events = {};
    }
    slowLoop() { // 5 s
        if (this.timers.c >= 1) {
            var mass = this.getTotalMass()

            this.emit('totmass', mass)

            this.timers.c = 12
        } else this.timers.c++;
    }
    loop() { // 0.005 s
        if (this.lag) {
            this.lagDel = !this.lagDel
            if (this.lagDel) return;

        }
        setTimeout(function () {
            this.updatePlayers()
        }.bind(this), 1)


        if (this.timers.a >= 100) {
            var lb = this.updateLB()
            this.checkMass()
            if (lb.length != 0) this.emit('lb', lb)

            this.timers.a = 0;
        } else this.timers.a++;


        if (this.timers.b >= 10) {
            if (this.bots.size > 0) {

                this.bots.forEach((bot) => {
                    setTimeout(function () {
                        bot.update()
                    }, 1)
                    if (bot.shouldSend()) this.toSend.push({
                        i: bot.id,
                        m: bot.mouse
                    })
                })

            }
            if (this.toSend[0]) this.send(this.toSend)

            this.toSend = [];
            this.timers.b = 0;
        } else this.timers.b++;





    }
    updatePlayers() {
        var final = [];
        if (this.players.size == 0 && this.bots.size == 0) return;
        this.players.forEach((player) => {
            if (player.cells.length == 0) return;
            player.cells.forEach((cell) => {
                var list = [];
                this.nodes.forEach(cell.getCheck(), (node) => {
                    if (node.id != cell.id) {

                        if (this.lag || cell.checkSend(node)) list.push(node.id)

                    }
                })
                final.push({
                    i: cell.id,
                    l: list
                })
            })
        })
        this.bots.forEach((player) => {
            if (player.cells.length == 0) return;
            player.cells.forEach((cell) => {
                var list = [];
                this.nodes.forEach(cell.getCheck(), (node) => {
                    if (node.id != cell.id) {

                        if (this.lag || cell.checkSend(node)) list.push(node.id)
                    }
                })

                final.push({
                    i: cell.id,
                    l: list
                })
            })
        })
        if (final.length == 0) return;
        var a = {
            d: final,
            p: true
        }

        this.send(a)

    }
    send(data) {

        try {
            process.send({
                id: this.id,
                data: data
            })

        } catch (e) {
            process.exit(0)
        }
    }
    getTotalMass() {
        var amount = 0;

        this.map.forEach((node, i) => {
            if (node.dead) {
                this.nodes.delete(i)
                this.map.delete(i)
                this.addedHash[node.id] = false;
                return;
            }
            amount += node.mass
        })
        return amount;
    }
    checkMass() {
        var list = [];
        var max = this.config.playerMaxMass
        this.players.forEach((player) => {
            player.cells.forEach((cell) => {
                if (cell.mass > max) list.push(cell.id)
            })

        })
        this.bots.forEach((player) => {
            player.cells.forEach((cell) => {
                if (cell.mass > max) list.push(cell.id)
            })

        })
        if (list.length == 0) return;
        this.emit('mass', list)
    }

    other() {

    }

}
