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
var HashBounds = require('hashbounds')
var QuickMap = require('quickmap')
var Node = require('./node.js')
var Bot = require('../ai/Bot.js')
var Player = require('./Player.js')
module.exports = class Manager {
    constructor() {
        this.nodes = [];
        this.addedHash = [];
         this.nodes = new HashBounds(500,true);
        this.toSend = [];
        this.map = new QuickMap()
        this.bots = new QuickMap()
        this.config = {};
        this.s = false;
        this.haveTeams = false;
        this.events = {}
        this.timers = {
            a: 100,
            b: 5
        }
        this.players = new QuickMap();
    }
    addNodes(nodes) {

        nodes.forEach((node)=>{
    
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
                        owner = new Player(node.owner,this)
                        this.players.set(node.owner,owner)
                    }
                }
                
            }
            
            
            var n = new Node(node,owner)
       
            this.nodes.insert(n)
            this.map.set(node.id,n)
            
        })
    }
    updateLB() {
        var hash = [];
        function insert(p) {
            p.getScore()
          
            if (!hash[p.mass]) hash[p.mass] = []; 
            hash[p.mass].push(p)
            
        }
        this.bots.forEach((bot)=>{
          insert(bot)
        })
        this.players.forEach((player)=>{
            
            insert(player)
        })
         var amount = this.getConfig().leaderBoardLen;
         var rank = 1;
        var lb = [];
        for (var i = hash.length; i > 0; i-- ) {
           if (!hash[i]) continue;
          if (!hash[i].every((h)=>{
            
         lb.push({
          r: rank++,
             i: h.id
         })
         amount --;
           if (amount <= 0) return false;
              return true;
          })) break;
        }
       
        return lb
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
        nodes.forEach((node)=>{
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
      
        nodes.forEach((node)=>{
            var n = this.map.get(node.id)
            if (n) {
               
             n.position.x = node.x
                n.position.y = node.y
                this.nodes.update(n)
            }
        })
    }
    stop() {
        clearInterval(this.interval)
        console.log("[Child Process] Stopped")
    }
    init(msg) {
        
       this.config = msg.config
       this.haveTeams = msg.teams
       try {
           
           clearInterval(this.interval)
       } catch (e) {
           
       }
          this.interval = setInterval(function() {
       this.loop()
         }.bind(this),100) 
          this.on('delPlayer',function(ps) {
          
               this.removeClient(ps)
               
           
          }.bind(this))
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
    addBot(id,bot) {
        this.bots.set(id,new Bot(id,this,bot))
    }
    emit(event,data) {
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
    on(e,f) {
        this.events[e] = f
    }
    clearEvents() {
        this.events = {};
    }
    loop() { // 0.01 s
        if (this.timers.a <= 0) {
            var lb = this.updateLB()
            if (lb.length != 0) this.emit('lb',lb)
            this.timers.a = 100;
        } else this.timers.a--;
        
        
        if (this.timers.b <= 0) {
            this.bots.forEach((bot)=>{
                 bot.update()
                 if (bot.shouldSend()) this.toSend.push({i:bot.id,m:bot.mouse})
             })
             try {
                 
             if (this.toSend[0]) process.send(this.toSend)
             } catch (e) {
               process.exit(0)
             }
             this.toSend = [];
            this.timers.b = 5;
        } else this.timers.b--;
        this.updatePlayers()
       
        
            
    }
    updatePlayers() {
        var final = [];
        this.players.forEach((player)=>{
            if (player.cells.length == 0) return;
            player.cells.forEach((cell)=>{
               var nodes = this.nodes.getNodes(cell.bounds)
               var list = [];
                nodes.forEach((node)=>{
                    if (node.id != cell.id) list.push(node.id)
                })
                final.push({i:cell.id,l:list})
            })
        })
         this.bots.forEach((player)=>{
            if (player.cells.length == 0) return;
            player.cells.forEach((cell)=>{
               var nodes = this.nodes.getNodes(cell.bounds)
               var list = [];
                nodes.forEach((node)=>{
                    if (node.id != cell.id) list.push(node.id)
                })
                final.push({i:cell.id,l:list})
            })
        })
        if (final.length == 0) return;
        var a = {
            d: final,
            p: true
        }
        try {
        process.send(a)
        } catch(e) {
                process.exit(0)
        }
    }
    other() {
        
    }
    
}
