"use strict";
var HashBounds = require('hashbounds')
var QuickMap = require('quickmap')
var Node = require('./node.js')
var Bot = require('../ai/Bot.js')
module.exports = class Manager {
    constructor() {
        this.nodes = [];
        this.addedHash = [];
         this.nodes = new HashBounds(500,true);
        this.toSend = [];
        this.map = new QuickMap()
        this.bots = new QuickMap()
        this.config = {};
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
            var owner = (node.owner) ? this.bots.get(node.owner) : false
            
            var n = new Node(node,owner)
       
            this.nodes.insert(n)
            this.map.set(node.id,n)
            
        })
    }
    spawn(bot) {
        this.toSend.push({
            id: bot.id,
            action: 1
        })
        
    }
    deleteNode(node) {
        node.destroyed = true;
         this.nodes.delete(node)
          this.map.delete(node.id)
          node.onDelete(this)
    }
    deleteNodes(nodes) {
        nodes.forEach((node)=>{
            var n = this.map.get(node.id)
            if (n) this.deleteNode(n)
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
          this.interval = setInterval(function() {
             this.bots.forEach((bot)=>{
                 bot.update()
                 this.toSend.push({i:bot.id,m:bot.mouse})
             })
             try {
             process.send(JSON.stringify(this.toSend))
             } catch (e) {
               process.exit(0)
             }
             this.toSend = [];
         }.bind(this),1000) 
    }
    addBot(id,bot) {
        this.bots.set(id,new Bot(id,this,bot))
    }
    other() {
        
    }
    
}
