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
var BotAi = require('./botAI.js')
module.exports = class Bot {
  constructor(id,server,botid) {
    this.id = id
    this.botid = botid
this.score = 0;
this.mouse = {
    x: 0,
    y: 0
}
this.center = {
     x: 0,
        y: 0
    }
this.team = 0;
this.playing = false;
 this.server = server;  
    this.cells = [];
     this.send = false;
   this.ai = new BotAi(this)
  }
     onRemove(main) {
   
        this.cells.forEach((cell)=>{
            main.removeNode(cell)
        })
      
    }
  addCell(cell) {

        if (this.cells.indexOf(cell) != -1) return; 
      this.cells.push(cell)
       
    }
  
   onDeath() {
      this.playing = false;
      
   }
    spawn() {
        this.playing = true;
   this.server.spawn(this)
 
    }
 getScore(re) {
        if (this.cells.length == 0) return 0;
       
        var l = 0;
        this.cells.forEach((n)=>{
           l+= n.mass; 
        })
        this.mass = l;
        this.score = Math.max(this.score,l)
        return this.score
 }
  
setRandom() {
       if (!this.a) return;
    var a = this.a
        this.mouse.x = Math.floor(a.width * Math.random()) + a.x;
          this.mouse.y = Math.floor(a.height * Math.random()) + a.y
         
}
    ejectMass() {
        this.server.ejectMass(this)
    }
    splitCells() {
        this.server.splitPlayer(this)
    }
    getSmallest() {
        if (this.cells.length == 0) return;
        var min = this.cells[0]
        
        this.cells.forEach((cell)=>{
            if (cell.mass < min.mass) min = cell;
        })
       return min;
    }
  update() { // 0.05 sec
   
        if (this.cells.length == 0 && !this.playing) this.spawn()
      var a = this.calcView()
      if (!a) return

       //   if (this.center.x == this.mouse.x || this.center.y == this.mouse.y) 
  this.view = a;
     this.nodes = this.server.nodes.getNodes(this.view)
  this.ai.update()
      
          // this.checkDeath()
          /*
      if (this.timers.changeDir >= 20) {
       this.timers.changeDir = 0;
          var a = this.calcView()
         this.mouse.x = Math.floor(a.width * Math.random()) + a.x;
          this.moude.y = Math.floor(a.height * Math.random()) + a.y
          this.checkDeath()
      } else {
    this.timers.changeDir ++;
      }
      */
 
    
  }
   
    calcView() {
         if (this.cells.length == 0) return
        var totalSize = 1.0;
        var x = 0, y = 0;
       // console.log(this.cells)
        this.cells.forEach((cell)=>{
            
            if (!cell) return
            x += cell.position.x
            y += cell.position.y
            totalSize += cell.getSize();
        })
        this.center.x = x / this.cells.length
        this.center.y = y / this.cells.length
         var factor = Math.pow(Math.min(64.0 / totalSize, 1), 0.4);
    this.sightRangeX = this.server.getConfig().serverViewBaseX / factor;
    this.sightRangeY = this.server.getConfig().serverViewBaseY / factor;
    this.a = {
        x:  this.center.x - this.sightRangeX,
        y: this.center.y - this.sightRangeY,
        height: 2 * this.sightRangeY, 
        width: 2 * this.sightRangeX        
    }
    return this.a
    }
    shouldSend() {
        var a = this.send
        if (this.send) this.send = false;
      return a
    }
    changeColor(color) {
       
        
    }
    changeName(name) {
        
        
    }
    removeCell(cell) {
        var ind = this.cells.indexOf(cell)
        if (ind != -1) this.cells.splice(ind,1)
       // console.log(this.cells.length)
        if (this.cells.length == 0) return this.onDeath()
    }
  
}
