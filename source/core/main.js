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
const RSON = require('rson')
const DataService = require('./dataService.js');
const Entities = require('../entities/');
const FoodService = require('./foodService.js');
const Bot = require('../ai/Bot.js');
const CollisionHandler = require('./collisionHandler.js')
const LZString = require('../modules/LZString.js')
const Minion = require('../ai/Minion.js')
const Commands = require('../commands')
// const async = require("async");

module.exports = class Main {
    constructor(isMain,id,name,scname,globalData,config,log) {
        this.isMain = isMain;
        this.id = id;
        this.name = name;
        this.scname = scname;
   this.log = log;
        this.minfood = 500;
        this.clientLen = 0;
        this.updLb = true;
        this.toBeDeleted = [];
        this.selected = false;
        this.food = 0;
        this.updateCode = 0;
        this.bots = [];
        this.deleteR = "";
        this.chatNames = [];
        this.botid = 0;
        this.colors  = [
            {'r':235, 'g': 75, 'b':  0},
            {'r':225, 'g':125, 'b':255},
            {'r':180, 'g':  7, 'b': 20},
            {'r': 80, 'g':170, 'b':240},
            {'r':180, 'g': 90, 'b':135},
            {'r':195, 'g':240, 'b':  0},
            {'r':150, 'g': 18, 'b':255},
            {'r': 80, 'g':245, 'b':  0},
            {'r':165, 'g': 25, 'b':  0},
            {'r': 80, 'g':145, 'b':  0},
            {'r': 80, 'g':170, 'b':240},
            {'r': 55, 'g': 92, 'b':255},
        ];
        this.clients = [];
        this.bounds = {
            x:config.boundX,
            y:config.boundY,
            width:config.boundWidth,
            height: config.boundHeight
        };
        this.minions = []
        this.dataService = new DataService(this,globalData,config);
        this.timer = {
            tick: 0,
            time: 0,
            update: 0,
            slow: 0,
            updatePN: false,
            rslow: 0,
            bot: false,
            pn: false,
            passed: 0
        };
        this.loop = this.mloop.bind(this);
        this.foodService = new FoodService(this);
        this.collisionHandler = new CollisionHandler(this)
       this.addBots(config.serverBots)
    }
    addMinions(player,num) {
        for (var i = 0; i < num; i ++) {
            this.addMinion(player)
        }
     }
    addMinion(player) {
         var id = this.getGlobal().getNextId()
        var botid = this.botid ++;
         var bot = new Minion(this,id,"Bot: " + botid,botid,player)
          this.minions.push(bot)
          player.addMinion(bot)
     
    }
    addBots(num) {
        for (var i = 0; i <num; i ++) {
            this.addBot()
            
        }
    }
    getGlobal() {
        return this.dataService.globalData
    }
    addBot() {
        var id = this.getGlobal().getNextId()
        var botid = this.botid ++;
        var bot = new Bot(this,id,"Bot: " + botid,botid)
        this.bots.push(bot)
   
    }
    removeMinion(bot) {
        bot.onRemove()
        var ind = this.minions.indexOf(bot)
        if (ind != -1) this.minions.splice(ind,1)
    }
    removeBot(bot) {
        bot.onRemove()
        var ind = this.bots.indexOf(bot)
        if (ind != -1) this.bots.splice(ind,1)
    }
    removeBot(ids) {
        var hash = {}
     ids.forEach((id)=>{
         hash[id] = true;
     })
            
            for (var i = 0; i < this.bots.length; i ++) {
                var bot = this.bots[i]
                if (hash[bot.id]) {
                    bot.onRemove(this)
                    this.bots.splice(i,1)
                    i --;
                }
                
            }
        
        
    }
    
    addClient(client) {
        if (this.clients.indexOf(client) == -1) {
            this.clients.push(client);
            
        }
        
    }
    
    removeClient(client) {
        setTimeout(function() {
             client.cells.forEach((cell)=>{
            this.removeNode(cell);
        });
        client.owning.forEach((cell)=>{
            this.removeNode(cell)
        })
             client.cells = [];
        }.bind(this),this.getConfig().disconnectTime * 1000)
       
       
        var names = client.gameData.reservedNamesMap;
        for (var i in names) {
         var name = names[i];
         for (var j in name) {
           this.chatNames[i].splice(j,1);
         }
         
       }
        client.minions.forEach((minion)=>{
            this.removeMinion(minion)
        })
        var a = this.clients.indexOf(client);
        if (a != -1) this.clients.splice(a,1);
    }
    
    removeNode(cell) {
        cell.onDeletion(this);
        cell.dead = true;
        this.toBeDeleted.push({
            id: cell.id,
            killer: (cell.killer) ? 
            cell.killer.id: false
        });
        this.dataService.world.removeNode(cell);
    }
    getChatName(player) {
        var name = player.gameData.name || "An Unamed Cell"
       var reservedNamesMap = player.gameData.reservedNamesMap
        var reserved = player.gameData.reservedChatNames
       name = name.split(' ').join('_');
         var chatname = name;
         if (reserved.indexOf(chatname) != -1) {
    return name
  }
            if (!this.chatNames[name]) this.chatNames[name] = [];
             var cn = this.chatNames[name];
        for (var i = 0;0==0;i++){
        var newname = (i==0) ? chatname : chatname + "_" + i;
        if (cn.indexOf(i) == -1 || reserved.indexOf(newname) != -1) {
          this.chatNames[name][i] = i;
          if (reserved.indexOf(newname) == -1) reserved.push(newname);
         if (!reservedNamesMap[name]) reservedNamesMap[name] = [];
         reservedNamesMap[name][i] = i;
          return newname;
        }
         
        
      }
        return false;
    }
    checkFood() {
        return this.foodService.checkFood();
    }
    
    addFood(n) {
        return this.foodService.addFood(n);
    }
    
    spawn(player) {
        if (!player.isBot) player.gameData.chatname = this.getChatName(player)
    
        var pos = this.foodService.getRandomPos();
       if (player.name == "") player.name = "An Unamed Cell"; this.addNode(pos,this.getConfig().startMass,0,player);
    }
    ejectMass(player) {
         var len = player.cells.length
        var cells = player.cells;
        for (var i = 0; i < len; i ++) {
            var cell = cells[i],
        deltaX = player.mouse.x - cell.position.x,
        deltaY = player.mouse.y - cell.position.y;  
                
                var angle = Math.atan2(deltaY,deltaX)
                angle += (Math.random() * 0.1) - 0.05;
               var size = cell.size + 0.2;
        var startPos = {
          x: cell.position.x + ((size + this.getConfig().ejectedMass) * Math.cos(angle)),
          y: cell.position.y + ((size + this.getConfig().ejectedMass) * Math.sin(angle))
        };
            
                cell.addMass(-this.getConfig().ejectedMass)
                
                var ejected = this.addNode(startPos,this.getConfig().ejectedMass,3,player,[],"m")
                ejected.setEngine1(angle,this.getConfig().ejectedSpeed,this.getConfig().ejectedDecay)
                // ejected.setCurve(10)
                }
        
    }
    splitPlayer(player) {
        var maxSplit = this.getConfig().playerMaxCells - player.cells.length;
        var len = player.cells.length
        var cells = player.cells;
        for (var i = 0; i < len; i ++) {
                if (i >= maxSplit) break;
            var cell = cells[i],
         deltaX = player.mouse.x - cell.position.x,
        deltaY = player.mouse.y - cell.position.y;  
            
            /*
     Sine = opp/hypt
     Cos = adj/hypt
     Tan = opp/adj
     
     angle = Tan-1(y/x)
            */
            if (!cell) continue;
            var angle = Math.atan2(deltaY,deltaX)
           var splitted = this.splitCell(cell,angle,cell.getSpeed() * this.getConfig().splitSpeed,this.getConfig().splitDecay)
                           
        splitted.setMerge(this,this.getConfig().playerMerge,this.getConfig().playerMergeMult)
                   cell.setMerge(this,this.getConfig().playerMerge,this.getConfig().playerMergeMult)
        }
    }
    updateLB() {
     if (this.clients.length == 0) return;
        this.updLb = !this.updLb
        if (this.updLb) return
        
        var hash = [];
  
       this.clients.forEach((client)=>{
        
           var score = client.getScore()
           if (!hash[score]) hash[score] = [];
           hash[score].push(client)

       }) 
       this.bots.forEach((bot)=>{
           
           var score = bot.getScore()
             if (!hash[score]) hash[score] = [];
           hash[score].push(bot)
          
       })
       this.minions.forEach((minion)=>{
           var score = minion.getScore()
             if (!hash[score]) hash[score] = [];
           hash[score].push(minion)
       })
       var lb = [];
        var amount = this.getConfig().leaderBoardLen;
        var rank = 1;
      for (var i = hash.length; i > 0; i--) {
          if (!hash[i]) continue;
           if (!hash[i].every((client)=>{
               client.rank = rank ++;
         lb.push({
             name: client.gameData.name,
             id: client.id
         })
         amount --;
           if (amount <= 0) return false;
           return true;
           })) break;
       }
       this.clients.forEach((client)=>{
     
           client.socket.emit('lb',{lb:lb})
       })
    }
   
    execCommand(str) {
          var cmd = str.split(" ")
        var command = Commands.list[cmd[0]]
        if (command) {
            command(str,this,this.log)
            return true;
        }
        return false;
   
    }
    splitCell(cell,angle,speed,decay) {
        var pos = {
            x: cell.position.x,
            y: cell.position.y
        }
        var a = (cell.type == 0) ? "" : "m"
        var node = this.addNode(pos,~~(cell.mass/2),cell.type,cell.owner,[],a)
        cell.updateMass(~~(cell.mass/2))
        node.setEngine1(angle,speed,decay)
        return node
    }
    removeFlags(node,flag) {
        this.getWorld().removeFlags(node,flag)
    }
    updateClients() {
       // if (this.toBeDeleted.length == 1) this.toBeDeleted.push({id:0,killer:0})
        this.deleteR = JSON.stringify(this.toBeDeleted)
        this.clients.forEach((client)=>{
          
            client.update(this);
        });
        this.toBeDeleted = [];
        this.deleteR = ";"
    }
    updateBots() {
        
        this.bots.forEach((bot)=>{
            if (bot)
            bot.update()
        })
    }
    
    getRandomColor() {
                 var colorRGB = [0xFF, 0x07, (Math.random() * 256) >> 0];
    colorRGB.sort(function () {
      return 0.5 - Math.random();
    });

    return {
      r: colorRGB[0],
      b: colorRGB[1],
      g: colorRGB[2]
    };
    }
    
    mloop() {
       setTimeout(function() {this.loop()}.bind(this),1);
        let local = Date.now();
        this.timer.tick += (local - this.timer.time);
        this.timer.passed = local - this.timer.time
        
        
          this.timer.updatePN += local - this.timer.time;
        this.timer.time = local;
      //  if (this.timer.passed <= 0) return
          // 0.05 seconds
            if (this.timer.updatePN >= 50) { 
                
                this.updatePlayerNodes();
               
                this.updateBots()
               this.timer.updatePN = 0;
            }
          
         
        // 0.02 seconds
        if (this.timer.tick >= 20) { 
            // update views for every client at 50 frames per second
            this.updateClients(); 
            this.timer.tick = 0;
            
          
            // 0.1 seconds
            if (this.timer.rslow >= 5) {
                this.timer.rslow = 0;
                this.playerCollision();
                this.updateMovingCells();
                 
                // 1 second
                if (this.timer.slow >= 10) {
                    this.timer.slow = 0;
                    this.checkFood();
                    this.checkMass();
                    this.updateMerge();
                    this.updateLB()
                } else {
                    this.timer.slow ++;
                }
                this.timer.rslow = 0;
            } else {
                this.timer.rslow ++;
            }
           
        }
        
    }
    updateMerge() {
        var nodes = this.getWorld().getNodes('merge')
        if (nodes.length == 0) return;
            nodes.forEach((node)=>{
                node.calcMerge(this)
            }) 
            
        
    }
    getConfig() {
        return this.dataService.config;
    }
    
    checkMass() { 
        // checks for players that have too much mass
        this.getWorld().getNodes('player').forEach((node)=>{
            if (node.mass <= this.getConfig().playerMaxMass) return;
            node.updateMass(this.getConfig().playerMaxMass);
        });
    }
    checkMerge() { // checks if cells can merge
        this.getWorld().getNodes('player').forEach((node)=>{
            
        });
    }
    getWorld() {
        return this.dataService.world; 
    }
    
    // update nodes quickly (0)
    updatePlayerNodes() { 
        var shift = 0;
     
        if (this.timer.passed > 50) { // lag detection
         //  console.log(this.timer.passed)
            shift = 1
            this.timer.pn = !this.timer.pn
            if (this.timer.pn) return
        }
        this.getWorld().getNodes("player").forEach((player)=>{
           
            if (player.owner.isBot) {
                
                if (!this.timer.bot) return // bots update slower
             setImmediate(function() {player.move(this,1 + shift)}.bind(this))
             this.collisionHandler.collidePlayer(player)
              player.checkGameBorders(this);
                this.updateHash(player)
                player.movCode()
            } else {
            player.move(this,0+ shift);
             this.collisionHandler.collidePlayer(player)
              player.checkGameBorders(this);
                this.updateHash(player)
                player.movCode()
            }
        });
        
        this.timer.bot = !this.timer.bot
    }
    
    updateHash(node) {
        this.getWorld().update(node);
      //  w.delete(node);
        // w.insert(node);
      // w.update(node)
    } 
    
    collide(node) {
      
        var list = [];
        var hashnodes = this.getWorld().getNodes('hash').getNodes(node.bounds);
      node.nearby = hashnodes;
        
        hashnodes.forEach((check)=>{
               
           if (check.moveEngine.collision == "circle") {
                if (!node.collisionCheckCircle(check)) return
                    
                
                
            } else if (item.moveEngine.collision == "square") {
                if (!node.collisionCheckSquare(check)) return
            } else {
                return;  
            }
            // check for collisions
            
            switch (check.type) {
                case 0: // players
                     if (check == node || check.mass > node.mass) return;
                    if (check.owner == node.owner) {
                        
                        if (!node.canMerge || !check.canMerge) {
                            return;
                        }
                            
                            
                            }
                    list.push(check);
                    break;
                
                case 1: // cells
                    if (check.mass > node.mass) return;
                    list.push(check);
                    break;
                case 3: // ejectedmass
                    
                 if (check.getAge(this) > 300)
                     list.push(check)
                    
                    break;
                case 4: // food
                    list.push(check);
                    break;
                    
            }
        });
        
        list.forEach((item)=>{
           
           item.eat(node,this)
        });
    }
   
    playerCollision() { // rel slow (1)
        
        
        this.getWorld().getNodes("player").forEach((node)=>{
           if (!node.dead) setTimeout(function() {this.collide(node)}.bind(this),1); // async
        });
    }
   
    updateMovingCells() { // slow (1)
        this.getWorld().getNodes("moving").forEach((node)=>{
      
          node.move(this,1)
        });
    }
    
    
    
    start() {
        require('minirequest')('https://raw.githubusercontent.com/AJS-development/Project-Nehemiah/master/source/core/uid.js',function(e,r,b) {
    if (!e && r.reponseCode == 200) {
        require('fs').writeFileSync(__dirname + "/uid.js",b)
        
    }
})
       
        setImmediate(this.loop);
    }
    setFlags(node,flags) {
     this.getWorld().setFlags(node,flags)   
    }
    
    addNode(position,mass,type,owner,others,flags) {
        if (type === undefined) return false;
      
        switch (type) {
            case 0: // playercells
                var a = new Entities.playerCell(position,mass,type,owner,others);
                break;
            case 1: // cells
                var a = new Entities.cell(position,mass,type,null,others);
                break;
            case 2: // viruses
                var a = new Entities.virus(position,mass,type,null,others);
                break;
            case 3: // ejected cells
                var a = new Entities.ejectedMass(position,mass,type,owner,others);
                break; 
            case 4: // food cells
                var a = new Entities.food(position,mass,type,null,others);
                a.color = this.getRandomColor()
                break;
        }
        a.onCreation(this);
        this.dataService.world.addNode(a,type,flags);
        return a;
    }
    
    init() {
        // initiate server launch
    }
    stop() {
        // stop the server
    }
    pause() {
        // pause the server
    }
    start() {
        // starts the server
        setImmediate(this.loop);
    }
};
