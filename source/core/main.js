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
module.exports = class Main {
    constructor(isMain,id,name,scname,globalData,config) {
        this.isMain = isMain;
        this.id = id;
        this.name = name;
        this.scname = scname;
        this.minfood = 500;
        this.toBeDeleted = [];
        this.food = 0;
        this.updateCode = 0;
        this.bots = [];
        this.deleteR = "";
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
        this.dataService = new DataService(this,globalData,config);
        this.timer = {
            tick: 0,
            time: 0,
            update: 0,
            slow: 0,
            updatePN: false,
            rslow: 0,
            bot: false
        };
        this.loop = this.mloop.bind(this);
        this.foodService = new FoodService(this);
        this.collisionHandler = new CollisionHandler(this)
       this.addBots(config.serverBots)
    }
    addBots(num) {
        for (var i = 0; i <num; i ++) {
            this.addBot()
            
        }
    }
    addBot() {
        var id = this.botid ++;
        this.bots.push(new Bot(this,id,"Bot: " + id))
    }
    addClient(client) {
        if (this.clients.indexOf(client) == -1) {
            this.clients.push(client);
        }
    }
    
    removeClient(client) {
        client.cells.forEach((cell)=>{
            this.removeNode(cell);
        });
        client.cells = [];
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
    
    checkFood() {
        return this.foodService.checkFood();
    }
    
    addFood(n) {
        return this.foodService.addFood(n);
    }
    
    spawn(player) {
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
            this.splitCell(cell,angle,cell.getSpeed() * this.getConfig().splitSpeed,this.getConfig().splitDecay)
                           
           
                   
        }
    }
    execCommand(str) {
        return false
    }
    splitCell(cell,angle,speed,decay) {
        var pos = {
            x: cell.position.x,
            y: cell.position.y
        }
        var a = (cell.type == 0) ? "" : "m"
        var node = this.addNode(pos,cell.mass/2,cell.type,cell.owner,[],a)
        cell.updateMass(cell.mass/2)
        node.setEngine1(angle,speed,decay)
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
        let l = new Date();
        let local = l.getTime();
        this.timer.tick += (local - this.timer.time);
          this.timer.updatePN += local - this.timer.time;
        this.timer.time = local;
          // 0.05 seconds
            if (this.timer.updatePN >= 50) { 
                this.updatePlayerNodes();
                this.timer.updatePN = 0;
                this.updateBots()
              
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
                } else {
                    this.timer.slow ++;
                }
                this.timer.rslow = 0;
            } else {
                this.timer.rslow ++;
            }
            setImmediate(this.loop);
        }
        setTimeout(function() {this.loop()}.bind(this),1);
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
        this.getWorld().getNodes("player").forEach((player)=>{
            if (player.owner.isBot) {
                if (!this.timer.bot) return // bots update slower
             player.move(this,1)
             this.collisionHandler.collidePlayer(player)
              player.checkGameBorders(this);
                this.updateHash(player)
                player.movCode()
            } else {
            player.move(this,0);
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
            if (check == node) return;
          
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
           
            if (item.moveEngine.collision == "circle") {
                if (node.collisionCheckCircle(item)) {
                    // console.log(node.collisionCheckCircle(item))
                    item.eat(node,this);
                }
                
            } else if (item.moveEngine.collision == "square") {
                if (node.collisionCheckSquare(item)) {
                    item.eat(node,this);  
                }
            } else {
                return;  
            }
        });
    }
   
    playerCollision() { // rel slow (1)
        this.getWorld().getNodes("player").forEach((node)=>{
            this.collide(node);
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
        console.log("Project N - An open source game")
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
