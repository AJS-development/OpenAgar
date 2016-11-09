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
module.exports = class Bot {
  constructor(server,id,name,botid) {
    this.id = id
    this.botid = botid
   this.server = server;
      this.isBot = true;
    this.mouse = {
            x: 0,
            y: 0
        }
    this.center = {
     x: 0,
        y: 0
    }
    this.mass = 0;
    this.timer = {
        changeDir: 0,
    }
     this.gameData = {
            name: name,
            color: server.getRandomColor(),
            chatname: "",
            reservedChatNames: [],
           chkDeath: false
        }
     this.score = 0;
     var t = new Date()
        this.alive = t.getTime()
    this.cells = [];
      this.spawn()
  }
     onRemove(main) {
        
    }
  addCell(cell) {
        if (this.cells.indexOf(cell) != -1) return; this.cells.push(cell)
       
    }
  
   onDeath() {
      this.mass = 0;
       this.score =0;
      this.alive = this.server.timer.time;
       this.playing = false;
       this.spawn()
   }
    spawn() {
     if (this.playing) return;
                
               
                this.server.spawn(this)
                this.calcView()
                this.setRandom()
                this.playing = true;   
    }
 getScore(re) {
      
        if (re) {
        var l = 0;
        this.cells.forEach((n)=>{
           l+= n.mass; 
        })
        this.mass = l;
        this.score = Math.max(this.score,l)
        return l
        }
        this.score = Math.max(this.score,this.mass)
        return this.score
    }
    calcView() {
 if (this.cells.length == 0) return
        var totalSize = 1.0;
        var x = 0, y = 0;
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
setRandom() {
    if (!this.a) return;
    var a = this.a
        this.mouse.x = Math.floor(a.width * Math.random()) + a.x;
          this.mouse.y = Math.floor(a.height * Math.random()) + a.y   
}
  update() { // 0.5 sec
     
      var a = this.calcView()
      if (!a) return
  
          if (this.center.x == this.mouse.x || this.center.y == this.mouse.y) this.setRandom()
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
    changeColor(color) {
        this.gameData.color = color
        this.cells.forEach((cell)=>{
            cell.color = color
        })
        
    }
    changeName(name) {
         this.gameData.name = name
        this.cells.forEach((cell)=>{
            cell.name = name
        })
        
    }
    removeCell(cell) {
        var a = this.cells.indexOf(cell)
        if (a != -1) this.cells.splice(a,1)
        if (this.cells.length == 0) this.onDeath()
    }
  
}
