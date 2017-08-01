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
const Stats = require('./Statistics.js');
const express = require('express');
const pem = require('pem');
const fs = require('fs')
const Server = require("simplesockets")

module.exports = class socketService {
    constructor(globalData, servers) {
        this.globalData = globalData;
        this.serverService = servers;
        this.clients = [];
        this.secure = _key() ? this.globalData.config.socketProtection : 0;
        this.iphash = {};
        this.ddos = false;
        this.uid = _uid()
        this.ddosbuf = 0;
        this.redirectLink = "http://opnagar.us/?ip=localhost:" + this.globalData.config.serverPort
        this.cwindow = 0;
        this.lastconn = 0;
        this.interval;
        this.password = 'd6F3Efeqe'; // will be encrypted later

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
        if (!this.serverService.TooBusy()) return true;
        if (this.lastconn[socket.IP] >= 10) return false;
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
            if (client._player.cells.size > 0) client.emit('ddos')
        })

    }
    stopDDOS() {
        if (this.ddos) {
            this.ddos = false;
            this.serverService.ddos(false)
            this.clients.forEach((client) => {
                if (client._player.size > 0) client.emit('ddosover')
            })
        }

    }
    start() {


        if (this.globalData.config.ssl) { // ssl
            console.log("gre{[OpenAgar]} Secure Socket (SSL) on".styleMe())

            try {
                var keys = JSON.parse(fs.readFileSync("rsa.json", "utf8"));

                if (!keys.key || !keys.certificate) {
                    console.log("gre{[OpenAgar]} RSA configuration invalid. Generating new".styleMe())
                    throw "invalid";
                }
                if (keys.expire) {
                    if (Date.now() > keys.expire) {
                        console.log("gre{[OpenAgar]} RSA Encryption Certificate has expired. Generating new".styleMe())
                        throw "expired";
                    }
                }

                console.log("gre{[OpenAgar]} Loaded RSA Certificate".styleMe())
                this.app = express();

                this._server = require("https").createServer({
                    key: keys.key,
                    cert: keys.certificate,
                    ca: keys.ca
                }, this.app).listen(this.globalData.config.serverPort);

                this.server = new Server({
                    server: this._server
                });


                this._start();

            } catch (e) {
                console.log("gre{[OpenAgar]} Creating RSA Certificate:".styleMe())
                pem.createCertificate({
                    days: 100,
                    selfSigned: true
                }, function (err, keys) {
                    fs.writeFileSync("rsa.json", JSON.stringify({
                        key: keys.serviceKey,
                        certificate: keys.certificate,
                        expire: Date.now() + 8553600000
                    }));
                    console.log("gre{[OpenAgar]} Generated self-signed certificate".styleMe())
                    this.app = express();

                    this._server = require("https").createServer({
                        key: keys.serviceKey,
                        cert: keys.certificate
                    }, this.app).listen(this.globalData.config.serverPort);

                    this.server = new Server({
                        server: this._server
                    });

                    this._start();
                }.bind(this));
            }
        } else {

            this.app = express()

            this._server = require("http").Server(this.app)

            this._server.listen(this.globalData.config.serverPort)

            this.server = new Server({
                server: this._server
            });

            this._start();
        }



    }
    getStatus() {
        var s = [];
        this.serverService.servers.forEach((server) => {

            if (server.status) s.push(server.status);
        })

        if (s.length === 0) return "Status not available. Please try again later";
        else return JSON.stringify(s)
    }
    _start() {
        this.app.get("/", (req, res) => {
            res.redirect(this.redirectLink)
        })
        this.app.get("/status", (req, res) => {
            res.send(this.getStatus())
        })

        this.serverService.log("gre{[OpenAgar]} Server listening on port ".styleMe() + this.globalData.config.serverPort)
        this.server.on('connection', function (socket) {

            this.cwindow++;
            if (this.ddos) return socket.disconnect();
            setImmediate(function () {
                if (this.checkDDOS(socket)) this.connection(socket);
                else socket.disconnect()
            }.bind(this));
        }.bind(this));

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

        }.bind(this), 1000);

        Stats(this, (c, a) => {
            if (c) this.redirectLink = "http://opnagar.us/server/" + a;
        });


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


        if (!this.iphash[socket.IP]) this.iphash[socket.IP] = 0;
        this.iphash[socket.IP]++;
        if (this.globalData.ban.indexOf(socket.IP) != -1) {
            socket._diconnect = true;
            socket.emit('kicked', "You have been banned")
            socket.disconnect()
            return;
        }
        if (this.globalData.globalBan[socket.IP]) {
            socket._diconnect = true;
            var d = this.globalData.globalBan[socket.IP];

            socket.emit('kicked', "You have been banned from OpenAgar by moderator " + d.banner + " for " + d.duration + " hour(s). Reason: " + d.reason);
            socket.disconnect();
            return;
        }
        if (!this.serverService.default) {
            socket._diconnect = true;
            socket.emit('kicked', "ERR: No default server exsists!")
            socket.disconnect();
        }
        if (this.iphash[socket.IP] > 10) {
            socket._diconnect = true;
            socket.emit('kicked', "You cannot have over 10 connections from the same ip!")
            socket.disconnect();
        }
        socket._activated = false;
        socket._disconnect = false;
        socket._uidp = this.uid + Math.floor(Math.random() * 1000)
        socket.emit('hello', {
            msg: "Achieved Connection",
            uid: socket._uidp,
            suid: this.uid,
            key: _key(),
            version: _version,
            secure: this.secure
        });
        var id = this.getNextId();
        socket._player = new Player(
            id,
            socket,
            this.serverService.default,
            this.globalData
        );
        if (this.secure) {
            socket._timeo = setTimeout(function () {
                if (!socket._activated && !socket._disconnect) {
                    socket._diconnect = true;
                    socket.emit('kicked', "Timeout: Your client waited too long")
                    socket.disconnect()
                }
            }, 1000)

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
            if (this.iphash[socket.IP]) this.iphash[socket.IP]--;
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
