"use strict";
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
        this.events = {}
        this.timers = {
            a: 10
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
            if (node.owner || node.owner === 0) {
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
            var a = function(p,i) {
            if (hash[p.mass + i]) return a(p,i + 1) 
            hash[p.mass + i] = p
                }
            a(p,0)
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
          
            
         lb.push({
          r: rank++,
             i: hash[i].id
         })
         amount --;
           if (amount <= 0) break;
       
        }
       
        return lb
    }
    
    spawn(bot) {
        this.toSend.push({
            id: bot.id,
            action: 1
        })
        
    }
   removeNode(node) {
        node.destroyed = true;
        node.dead = true;
         this.nodes.delete(node)
          this.map.delete(node.id)
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
    loop() { // 0.1 s
        if (this.timers.a <= 0) {
            var lb = this.updateLB()
            this.emit('lb',lb)
            this.timers.a = 10;
        } else this.timers.a--;
        
        
        
        
              this.bots.forEach((bot)=>{
                 bot.update()
                 if (bot.shouldSend()) this.toSend.push({i:bot.id,m:bot.mouse})
             })
             try {
             process.send(JSON.stringify(this.toSend))
             } catch (e) {
               process.exit(0)
             }
             this.toSend = [];
    }
    other() {
        
    }
    
}
