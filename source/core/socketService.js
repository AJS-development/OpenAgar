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
    constructor(globalData,servers) {
        this.globalData = globalData;
        this.serverService = servers;
        this.clients = [];
      
        this.uid = _uid()
        
        this.password = 'd6F3Efeqe'; // will be encrypted later
        this.io = require("socket.io");
        this.server = this.io(this.globalData.config.serverPort);
        this.server.on('connection', function (socket) {
            this.connection(socket);
        }.bind(this));
        if (!this.uid) throw "UID not specified"
        
        if (!_checkKey(_key)) this.server.close()
    }
    getNextId() {
        return this.globalData.getNextId()
    }


    connection(socket) {
        socket._remoteAddress = socket.request.connection.remoteAddress
        
         socket._activated = false;
        socket._disconnect = false;
        socket._uidp = this.uid + Math.floor(Math.random() * 1000)
        socket.emit('hello', {msg:"Achieved Connection",uid: socket._uidp,suid: this.uid,key: _key,version:_version,secure: this.globalData.config.socketProtection});
      var id = this.getNextId();
       socket._player = new Player(
            id,
            socket,
            this.serverService.default,
            this.globalData
        );
        if (this.globalData.config.socketProtection) {
        socket._timeo = setTimeout(function() {
        if (!socket._activated && !socket._disconnect) {
            socket._diconnect = true;
             socket.emit('kicked',"Timeout: Your client waited too long")
            socket.disconnect()
        }
        },700)
        function setup(socket) {
            socket._activated = true;
             socket.emit('accepted',"Welcome")
             socket.emit('mes',{type:"clearNodes"})
             socket.emit('mes',{type:"setPid",pid: socket._player.id})
               socket.emit('mes',{type:"showOverlay"})
                socket.emit('mes',{type:"setFPS",fps: 6})
        }
        socket.on('key',function(data) {
            if (!data) return;
               var uid = socket._uidp
               socket._key = data.toString()
               // some algorithm
               var a = _socketOkay(socket)
              
               if (a) {
           
            setup(socket)
              
               } else {
                   socket.emit('kicked',"Key not valid. You may be a bot!")
                   socket._disconnect = true;
                   socket.disconnect();
                   
               }
        }.bind(this));
        } else {
            setup(socket)
        }
        socket.on('cha',function(data) {
            if (!socket._activated) return;
            try { 
                data = data.toString();
                data = RSON.parse(data);
                socket._player.changeServers(data,this.serverService);
            } catch (e) {
                console.log(e);
            }
        });
        socket.on('pong',function(data) {
            
        })
        socket.on('mes',function(data) {
            if (!socket._activated) return;
       
         
            socket._player.onmsg(data);
        });
        socket.on('mouse',function(data) {
            if (!socket._activated) return;
           
            socket._player.recmouse(data);
        });
        socket.on('disconnect',function() {
         socket._disconnect = true;   
            socket._player.onDisconnect()
           var i = this.clients.indexOf(socket)
            if (i != -1) this.clients[i] = false;
            
        }.bind(this))
        socket.on('chat',function(data) {
            if (!data) return;
            data = data.toString()
            socket._player.onChat(data)
        })
        this.clients.push(socket);
    }
};
