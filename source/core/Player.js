"use strict"
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

const FormatNode = require('./formatNode.js')
const Socket = require('./socket.js')
module.exports = class Player {
    constructor(id,socket,server, globalData) {
        this.id = id;
       
        this.server = server;
        this.mouse = {
            x: 0,
            y: 0
        }
        
        this.keys = {
            w: false,
            space: false,
            e: false,
            r: false,
            t: false,
            q: false
        }
        this.nodeHash = {};
        this.hashnodes = [];
        this.moveView = [];
        this.upmoveHash = {};
        this.moveHash = {};
        
        this.cellHash = {};
       this.timer = {
        view: 0,
          second: 0
       }
        this.gameData = {
            name: "",
            color: server.getRandomColor(),
            chatname: "",
            reservedChatNames: [],
           chkDeath: false
        }
        
        this.killer = false;
        this.globalData = globalData
        this.view = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
        this.lastVis = []
        this.center = {
            x: 0,
            y: 0
        }
        this.toSend = []
        this.visSimple = []
        this.visible = []
       
        this.cells = [];
        this.playing = false;
        this.socket = new Socket(socket,this)
        this.server.addClient(this)
        this.sendData = true;
        var t = new Date()
        this.alive = t.getTime()
        
    }
    
    changeServers(msg,servers) {
    if (!msg || !msg.id) return
    if (!servers.servers[msg.id]) {
        this.socket.emit("msg",{type: "error",msg: "Server not found"})
        return;
    }
        if (this.server) this.server.removeClient(this)
        this.server = server;
        this.server.addClient(this)
        this.init()
    }
    init() {
        this.socket.emit('mes',{type: "setBorder",bounds: this.server.bounds})
    }
    recmouse(data) {
        
        if (!data) return;
        try {
        data = data.split("|")
        var x = parseInt(data[0])
        var y = parseInt(data[1])
        if (!isNaN(x)) this.mouse.x = x;
          if (!isNaN(x)) this.mouse.y = y
        } catch (e) {
            console.log(e)
        }
    }
    addCell(cell) {
        if (this.cells.indexOf(cell) != -1) return; this.cells.push(cell)
        this.cellHash[cell.id] = true;
        this.socket.emit('mes',{type: "addNode",id:cell.id})
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
            cell.updCode()
        })
        
        
    }
    removeCell(cell) {
        var a = this.cells.indexOf(cell)
        if (a != -1) this.cells.splice(a,1)
        this.cellHash[cell.id] = false;
        if (this.cells.length == 0) this.onDeath(this,cell.killer)
    }
    checkKeys(main) {
        if (this.keys.space) {
            this.keys.space = false;
            main.splitPlayer(this)
        }
            if (this.keys.w) {
                this.keys.w = false;
                main.ejectMass(this)
            }
                if (this.keys.e) {
                    
                }
        
    } 
    pressKey(id) {
       // console.log(id)
        id = parseInt(id)
      switch (id) {
          case 32: // space
              this.keys.space = true
              break;
          case 81: // q
              this.keys.q = true
              break;
          case 87: // w
              this.keys.w = true
              break;
          case 69: // e
              this.keys.e = true;
              break;
          case 82: // r
              this.keys.r = true;
              break;
          case 84: // t
              this.keys.t = true;
              break;
          case 27: // esc
              
              break;
              
      }
              
              
    }
    onmsg(msg,servers) {
        if (!msg || !msg.type) return;
        switch (msg.type) {
            case "play":
                
                if (this.playing) return;
                this.sendData = true;
                this.gameData.name = (msg.name) ? msg.name : "";
                
                this.server.spawn(this)
                 this.resetView()
                this.playing = true;
                break;
            case "chat":
                servers.chat(msg.chat,this.server)
                break;
            case "key":
                this.pressKey(msg.id)
                break;
                
        }
        
    }
    resetView(){
        this.nodeHash = {};
        this.hashnodes = [];
        this.moveView = [];
        this.upmoveHash = {};
        this.moveHash = {};
        
        this.cellHash = {};
        this.view = {};
        
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
    this.view.x =  this.center.x - this.sightRangeX;
        
        this.view.y = this.center.y - this.sightRangeY;
        this.view.height = this.sightRangeY*2
        this.view.width = this.sightRangeX*2
      //  console.log({x:this.view.x,y:this.view.y,width: this.view.width,height:this.view.height})
    }
    doesFit(node) {
        var posX = node.position.x
        var posY = node.position.y
        var top = this.view.y
        var bottom = this.view.y + this.view.height
        var left = this.view.x
        var right = this.view.x + this.view.width
        if (posX < left) {
            // console.log("x:lef " + posX + "<" + left)
            return false;
        }
        if (posX > right) {
           // console.log("x:rig " + posX + ">" + right)
            return false;
        }
        if (posY > bottom) {
          //  console.log("y:bot " + posY + "<" + bottom)
            return false;
        }
        if (posY < top) {
           // console.log("y:top " + posY + ">" + top)
            return false;
        }
        return true
    }
    sendNode(node,main) {

     var n = FormatNode(node,main)
   
    // this.visSimple.push(n)
    
      //  if (this.lastVis.indexOf(JSON.stringify(n)) == -1)
    
     this.toSend.push(n)
       
    }
    sendDelNode(node) {
        this.toSend.push({
            remove: node.id
            
            
        })
        
    }
    onDisconnect() {
        this.playing = false;
        this.sendData = false;
        this.server.removeClient(this)
        
    }
   onDeath(main,killer) {
       this.killer = (killer && killer.owner) ? killer.owner : false;
       
      this.socket.emit('rip',{alive: main.timer.time - this.alive, killerId: (killer && killer.owner) ? killer.owner.id : -1})
      this.alive = main.timer.time;
       
           this.playing = false;
setTimeout(function() { // let the player see who killed them
    if (this.playing) return
    this.sendData = false;
}.bind(this),900)
   }
    send() {
    
        if (this.toSend.length == 0) return;
        
        this.socket.sendNodes(this.toSend)
       this.toSend = [];
    }
    sendMoveUpt(node) {
        
        this.toSend.push({moveUpt: node.id,x: node.position.x,y:node.position.y})
    }
    update(main) { // every 0.02 sec
        if (!this.sendData) return;
        if (this.timer.view >= 5) { // 0.1 sec update viewframe
            this.checkKeys(main)
           this.calcView()
            var hash = this.server.getWorld().getNodes('hash');
        this.hashnodes = hash.getNodes(this.view)
          
     
         this.timer.view = 0;
           
        } else {
         this.timer.view ++;  
        }
       if (!this.view) return;
        this.visible = [];
        this.toSend = [];
        
       if (main.toBeDeleted.length > 0) this.deleteNodes(main);
         if (this.cells.length == 0) return;
       
    var hashtable = {};
        this.hashnodes.forEach((node)=>{
if (node.dead) return;
            if (!this.doesFit(node)) return;
           hashtable[node.id] = true;
      if (node.moving && !this.moveHash[node.id] && !this.cellHash[node.id]) {
          this.moveView.push(node)
          this.moveHash[node.id] = true;
           
      } 
          
      
          if (this.nodeHash[node.id] == node.updateCode) {
             if (this.upmoveHash[node.id] != node.moveCode) {
              this.sendMoveUpt(node);
               
              return;
          }
              return;
          }
            this.upmoveHash[node.id] = node.moveCode;
         this.nodeHash[node.id] = node.updateCode;
          
      
            
            this.visible.push(node)
            this.sendNode(node,main)
            
        });
        /*
        this.cells.forEach((node)=>{
            if (!this.doesFit(node) || this.visible.indexOf(node) != -1) return;
         this.sendNode(node,main)
            this.visible.push(node)
        })
       
        */
        var splist = [];
        this.moveView.forEach((node,id)=>{
            if (!node.dead && node.moving && this.doesFit(node)) {
                
                
            } else {
                
                splist.push(id)
                this.moveHash[node.id] = false;
                this.sendDelNode(node)
      this.upmoveHash[node.id] = false;
         this.nodeHash[node.id] = false;
            }
            
        })
        var buf = 0;
        splist.forEach((id)=>{
            this.moveView.splice(id - buf,1)
            buf ++;
            })
     if (this.killer) {
         this.killer.cells.forEach((node)=>{
             if (hashtable[node.id]) return;
             
              this.visible.push(node)
            this.sendNode(node,main)
         })
         
     }
        this.lastVis = this.visSimple;
        this.visSimple = [];
        
        this.send();
        
    }
    getScore() {
        var l = 0;
        this.cells.forEach((n)=>{
           l+= n.mass; 
        })
        return l
    }
   deleteNodes(main) {
 
       this.socket.sendDelete(main.deleteR)
   }
}
