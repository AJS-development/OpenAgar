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
const Commands = require('../commands')
const SocketService = require('./socketService.js');
const Main = require('./main.js');
module.exports = class ServerService {
    constructor(controller,globalData) {
        this.globalData = globalData;
        this.controller = controller;
    var config = {
        
      serverViewBaseX: 1380,
            serverViewBaseY: 820,
            startMass: 20,
            playerMaxMass: 2000,
        minFood: 500,
        boundX: 0,
        boundY: 0,
        boundWidth: 10000,
        boundHeight: 10000,
        playerSpeed: 40,
        splitSpeed: 100,
        splitDecay: 20,
        playerMaxCells: 32,
        ejectedMass: 10,
        ejectedSpeed: 200,
        ejectedDecay: 5,
        serverBots: 0,
        playerMergeMult: -0.05,
        playerMerge: 8
    }
        var serv = new Main(true,0,"Main","Main",globalData,config);
        this.servers = [];
        this.ids = 0;
        this.servers[0] = serv;
        this.selected = serv;
        this.default = serv;
        this.socketService = new SocketService(globalData,this);
        serv.init();
    }
    getNextId() {
        return this.ids ++;
    }
    start() {
        this.default.start();
    }
    execCommand(str) {
        if (!str) return;
        
        var cmd = str.split(" ");
        
        if (this.prsCommand(str)) return
        if (!this.selected) return;
        if (!this.selected.execCommand(str)) console.log("The command " + cmd[0] + " was not found! Type 'help' to view a list of commands.")
    }
    prsCommand(str) {
      
        var cmd = str.split(" ")
        var command = Commands.serverService[cmd[0]]
        if (command) {
            command(this,str)
            return true;
        }
        return false;
    }
    create(name,configs) {
        
    }
};

