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

const RSON = require('rson');
const Player = require('./Player.js');
const crypto = require('crypto')

module.exports = class socketService {
    constructor(globalData, servers) {
        this.globalData = globalData;
        this.serverService = servers;
        this.clients = [];
        this.iphash = {};
        this.ddos = false;
        this.uid = _uid()
        this.ddosbuf = 0;
        this.cwindow = 0;
        this.lastconn = 0;
        this.interval;
        this.password = 'd6F3Efeqe'; // will be encrypted later
        this.io = require("socket.io");
        if (!this.uid) throw "UID not specified"


        this.debug("gre{[Debug]} UID: ".styleMe() + this.uid)

    }
    checkDDOSWindow() {

        if (this.cwindow > 100) {
            this.cwindow = 0;
            return true;
        }
        this.cwindow = 0;
        return false;
    }
    checkDDOS(socket) {

        if (this.lastconn[socket._remoteAddress] >= 10) return false;
        if (this.clients.length >= 1000) return false;
        var time = Date.now()
        var dif = time - this.lastconn;
        this.lastconn = time;
        if (dif <= 100) return false;
        return true;
    }
    onDDOS() {
        if (this.ddos) return;
        this.ddos = true;
         this.ddosbuf = 5
        this.serverService.ddos(true)
        this.clients.forEach((client) => {
            if (client._player.playing) client.emit('ddos')
        })

    }
    stopDDOS() {
        if (this.ddos) {
            this.ddos = false;
            this.serverService.ddos(false)
            this.clients.forEach((client) => {
                if (client._player.playing) client.emit('ddosover')
            })
        }

    }
    start() {
        this.server = this.io(this.globalData.config.serverPort);
        this.serverService.log("gre{[OpenAgar]} Server listening on port ".styleMe() + this.globalData.config.serverPort)
        this.server.on('connection', function (socket) {
            this.cwindow++;
            if (this.ddos) return socket.disconnect();
            setImmediate(function () {
                socket._remoteAddress = socket.request.connection.remoteAddress
                if (this.checkDDOS(socket)) this.connection(socket);
                else socket.disconnect()
            }.bind(this));
        }.bind(this));

        if (!_checkKey(_key)) this.server.close()
        this.debug("gre{[Debug]} Started socket.io on port ".styleMe() + this.globalData.config.serverPort)
        this.interval = setInterval(function () {
            var a = this.checkDDOSWindow()
            if (a) {
                this.ddosbuf += 0.1;
                this.onDDOS()

            } else {
                if (this.ddosbuf <= 0) {
                    this.ddosbuf = 0;
                    this.stopDDOS()
                } else {
                    this.ddosbuf--;
                }
            }

        }.bind(this), 1000)
    }
    stop() {
        this.debug("gre{[Debug]} Closed socket".styleMe())
    }
    debug(a) {
        this.serverService.debug(a)
    }
    getPlayer(id) {
        var player = false
        this.clients.every((client) => {
            if (client._player.id != id) return true;
            player = client._player
            return false
        })
        return player;
    }
    getNextId() {
        return this.globalData.getNextId()
    }
    setup(socket) {
        socket._activated = true;
        socket.emit('accepted', "Welcome")
        socket.emit('mes', {
            type: "reset"
        })
        socket.emit('mes', {
            type: "setPid",
            pid: socket._player.id
        })
        socket.emit('mes', {
            type: "showOverlay"
        })
        socket.emit('mes', {
            type: "setFPS",
            fps: 10
        })
        this.sendInfoPacket(socket)
    }
    reloadInfoP() {
        this.clients.forEach((client) => {
            this.sendInfoPacket(client)
        })
    }
    sendInfoPacket(socket) {
        var data = [];
        this.serverService.servers.forEach((server) => {
            data.push({
                id: server.id,
                name: server.name,
                scn: server.scname,
                players: server.clients.length,
                bots: server.bots.length

            })
        })

        socket.emit('infop', data)
    }

    connection(socket) {


        if (!this.iphash[socket._remoteAddress]) this.iphash[socket._remoteAddress] = 0;
        this.iphash[socket._remoteAddress]++;
        if (this.globalData.ban.indexOf(socket._remoteAddress) != -1) {
            socket._diconnect = true;
            socket.emit('kicked', "You have been banned")
            socket.disconnect()
            return;
        }
        socket._activated = false;
        socket._disconnect = false;
        socket._uidp = this.uid + Math.floor(Math.random() * 1000)
        socket.emit('hello', {
            msg: "Achieved Connection",
            uid: socket._uidp,
            suid: this.uid,
            key: _key,
            version: _version,
            secure: this.globalData.config.socketProtection
        });
        var id = this.getNextId();
        socket._player = new Player(
            id,
            socket,
            this.serverService.default,
            this.globalData
        );
        if (this.globalData.config.socketProtection) {
            socket._timeo = setTimeout(function () {
                if (!socket._activated && !socket._disconnect) {
                    socket._diconnect = true;
                    socket.emit('kicked', "Timeout: Your client waited too long")
                    socket.disconnect()
                }
            }, 700)

            socket.on('key', function (data) {
                if (this.ddos) return;
                if (!data || socket._keySent) return;
                socket._keySent = true;
                var uid = socket._uidp
                socket._key = data.toString()
                    // some algorithm
                var a = _socketOkay(socket)

                if (a) {

                    this.setup(socket)

                } else {
                    this.cwindow++;
                    socket.emit('kicked', "Key not valid. You may be a bot!")
                    socket._disconnect = true;
                    socket.disconnect();

                }
            }.bind(this));
        } else {
            this.setup(socket)
        }
        socket.on('cha', function (data) {

            if (!socket._activated || this.ddos) return;

            if (!data.id) return;
            socket._player.changeServers(data.id, this.serverService);
            socket.emit('mes', {
                type: "reset"
            })

        }.bind(this));
        socket.on('pong', function (data) {

        })
        socket.on('mes', function (data) {
            if (!socket._activated || this.ddos) return;


            socket._player.onmsg(data);
        });
        socket.on('mouse', function (data) {
            if (!socket._activated || this.ddos) return;

            socket._player.recmouse(data);
        });
        socket.on('disconnect', function () {
            socket._disconnect = true;
            socket._player.onDisconnect()
            if (this.iphash[socket._remoteAddress]) this.iphash[socket._remoteAddress]--;
            var i = this.clients.indexOf(socket)
            if (i != -1) this.clients.splice(i, 1)

        }.bind(this))
        socket.on('chat', function (data) {
            if (!data || this.ddos) return;
            data = data.toString()
            socket._player.onChat(data)
        })
        this.clients.push(socket);
    }
};
