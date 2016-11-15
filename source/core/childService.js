"use strict";
var Child = require('child_process')
var QuickMap = require('quickmap')
module.exports = class childService {
  constructor(main) {
    this.cpus = require('os').cpus().length
    this.child = Child.fork(__dirname + '/../child/index.js')
    
    this.main = main;
      this.toSend = [];
      this.updHash = {};
      this.movHash = {};
    this.movCode = [];
      this.hash = [];
      
   this.bots = new QuickMap()   
   this.init()
  }
  init() {
      this.child.on('message',function(data) {
          this.onData(data)
      }.bind(this))
       this.send(0,{hello:"hello",config: this.main.getConfig()})
    
  }
    action(bot,action,data) {
        switch (action) {
            case 1: // spawn
                
                this.main.spawn(bot)
                break;
        }
    }
    onData(data) {
        
        data = JSON.parse(data)
        
     // console.log(data)
        data.forEach((bot)=>{
            if (bot.action) {
                   var b =this.bots.get(bot.id)
                   this.action(b,bot.action,bot)
            } else {
            var b =this.bots.get(bot.i)
            
            b.mouse.x = bot.m.x
            b.mouse.y = bot.m.y
            }
        })
    }
    stop() {
   
    }
    send(type,data) {
        data.type = type;
      try {
      this.child.send(JSON.stringify(data))
      } catch (e) {
  
      }
    }
  addBot(bot) {
      this.bots.set(bot.id,bot)
this.send(5,{id: bot.id, bot: bot.botid})
  }
  addNode(node) {
      if (this.hash[node.id]) return;
      this.toSend.push({
          id: node.id,
          size: node.size,
          type: node.type,
          bounds: node.bounds,
          position: node.position,
          owner: (node.owner) ? node.owner.id : false,
          mass: node.mass
          
          
      })
      this.hash[node.id] = true;
      
  }
    deleteNodes(nodes) {
        if (nodes[0])
        this.send(2,{nodes:nodes})
       
    }
    sendMove(node) {
        this.movCode.push({
            id: node.id,
            x: node.position.x,
            y: node.position.y
        })
        
    }
    update() {
        var nodes = this.main.getWorld().getNodes('player')
        
        nodes.forEach((node)=>{
           
            if (node.updateCode != this.updHash[node.id]) {
                this.updHash[node.id] = node.updateCode
                this.addNode(node)
            } else if (node.moveCode != this.movHash[node.id]) {
                this.movHash[node.id] = node.moveCode
            this.movCode.push({
                id: node.id,
                x: node.position.x,
                y: node.position.y
            })
            }
            
        })
         if (this.movCode[0]) this.send(3,{nodes:this.movCode})
         this.movCode = [];
        
    }
    
  sendNodes() {
      if (!this.toSend[0]) return
      this.send(1,{nodes:this.toSend})
      this.toSend = [];
  }
  
}
