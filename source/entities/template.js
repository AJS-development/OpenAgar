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
module.exports = class template {
  constructor(position,mass,type,owner,other) {
  this.id = null;
  this.position = position
  this.mass = mass;
  this.owner = owner;
  this.moving = false;
  this.type = 1;
  this.killer = null;
      this.dead = false;
      this.updateCode = 1;
      this.moveCode = 1;
this.velocity = 0;
 this.name = "";
    this.color = {
     r: 0,  
     g: 0,
     b: 0
    }
    this.moveEngine2 = {
        pointX: 0,
        pointY:0,
        velocityInit: 0,
        acceleration: 0,
        useEngine: false,
        delatT: 0,
        maxDeltaT: 0
        
    }
   
    this.moveEngine = {
        collision: "circle",
       acceleration: 0,
       velocityInit: 0,
        maxDeltaT: 0,
       deltaT: 0,
       useEngine: false,
        delatX: 0,
        maxDeltaX: 0,
        curveB: 0,
        curveM: 0,
        deltaCurve:0,
        maxCurve: 0,
        useCurve: false
    }
    this.nearby = [];
  this.other = other
  this.size = Math.ceil(Math.sqrt(100 * this.mass));
     this.getSpeed()
     this.getSize()
     this.agit = false
     this.spiked = false
     var d = new Date()
        this.created = d.getTime()
  }
  updCode() {
      this.updateCode ++;
      if (this.updateCode > 10000) this.updateCode = 1;
  }
    movCode() {
      this.moveCode ++;
      if (this.moveCode > 10000) this.moveCode = 1;
  }
setPos(x,y) {
    this.position.x = parseInt(x)
    this.position.y = parseInt(y)
   
}
    addPos(x,y) {
        this.setPos(this.position.x+x,this.position.y+y)
    }
    getSlope(x,y) {
        var deltax = this.position.x - x
        var deltay = this.position.y - y
        return deltay/deltax
    } 
     
    getAge(main) {
    if (!this.created) return;
       
        return main.timer.time - this.created;
    }
   getSpeed() {
      this.speed = Math.pow(this.mass, -1.0 / 4.5) * 50 / 40;
      return this.speed
   }
  
   getDistance(x1,y1,x2,y2) {
       if (!x2) x2 = this.position.x;
       if (!y2) y2 = this.position.y;
      var distx = x1 - x2
      var disty = y1 - y2

      return Sqrt.sqrt(distx * distx + disty * disty)
    //  return ~~(Math.sqrt(distx * distx + disty * disty))
   }
  addMass(m) {
      // console.log(m)
      this.updateMass(this.mass + m)
      
  }
   checkGameBorders(main) {
    // cell should only go a quarter in the border
      var y = this.position.y
      var x = this.position.x
       var radius = this.size
      var add = radius / 2 // quarter 
      var bounds = main.bounds
      var border = {
       top: bounds.y - add,
       bottom: bounds.y + bounds.height + add,
       left: bounds.x - add,
        right: bounds.x + bounds.width + add
      }
      // stop the cell
      if (y < border.top) { // effeciency, dont do the next check if first check passes
         this.position.y = border.top
      } else if (y > border.bottom) {
         this.position.y = border.bottom
      }
      if (x > border.right) {
         this.position.x = border.right
      } else if (x < border.left) {
         this.position.x = border.left
      }
      
      
   }

   eat(node,main) {
       
    this.killer = node
    this.killer.addMass(this.mass)
    main.removeNode(this)
  node.updCode()
  
   }
    doesCollide(node,main) {
        return false;
    }
  getSize() {
      this.size = Math.ceil(Math.sqrt(100 * this.mass));
     return this.size
  }
    getOwner(main) {
        return this.owner
    }
    updateMass(mass) {
        this.mass = Math.max(mass,10)
        this.getSize()
        
        this.speed = Math.pow(this.mass, -1.0 / 4.5) * 50 / 40;
        this.updCode()
    }
  onAdd(id) {
    this.id = id;
  }
  onCreation(main) {
    
  }
  onDeletion(main) {
    
  }
   getEatRange() {
   
     return this.size * -0.4;   
    
   }
    collisionCheckCircle(node,no) {
      var distance = this.getDistance(node.position.x,node.position.y);
        var s = (no) ? node.size : node.getEatRange()
      if (distance <= this.size + s) return true;
      return false;
   }
    collisionCheckSquare(bounds) {
  // Collision checking
 var Left = bounds.x, Right = bounds.x + bounds.width, Top = bounds.y,Bottom = bounds.y + bounds.height
        return ((Left  < this.bounds.x + this.bounds.width) && (Right > this.bounds.x) && (Top  < this.bounds.y + this.bounds.height) && (Bottom > this.bounds.y))
}
    getName() {
        return this.name
    }
    getColor() {
        return this.color
    }
    setEngine1(angle,velocity,t) {
      this.setEngine(angle,velocity,0,false,t)
    }
    setEngine2(x,y,velocityinit,acceleration,maxt) {
        var m = this.moveEngine2;
        m.pointX = x
        m.pointY = y;
        m.acceleration = acceleration;
        m.velocityInit = velocityinit
        m.maxDeltaT = maxt
        m.delatT = 0;
        m.useEngine = true;
    }
   setEngine(angle,velocityinit,accel,dist,t) {
      this.moveEngine.angle = angle;
       this.moveEngine.velocityInit = velocityinit
       this.moveEngine.deltaT = 0;
       this.moveEngine.maxDeltaT = t;
       this.moveEngine.deltaX = 0;
       this.moveEngine.maxDeltaX = dist;
       this.moveEngine.acceleration = accel || 0
      this.moveEngine.useEngine = true;
       this.moveEngine.cos = Math.cos(angle)
       this.moveEngine.sin = Math.sin(angle)
       
   }
    setCurve(constant,slope,max) {
        this.moveEngine.curveB = constant || 0
        this.moveEngine.curveM = slope || 0
        this.moveEngine.deltaCurve = 0
        this.moveEngine.maxCurve = max
        this.moveEngine.useCurve = true;
    }
    moveDone(main,method) {
        
       if (!this.moveEngine.useEngine && !this.moveEngine2.useEngine) main.removeFlags(this,"m")
    }
    
    calcMove2(main,speed) {
        
        var m = this.moveEngine2;
      
         deltaX = m.pointX - this.position.x,
        deltaY = m.pointY - this.position.y;  
            
            /*
     Sine = opp/hypt
     Cos = adj/hypt
     Tan = opp/adj
     
     angle = Tan-1(y/x)
            */
           
            var angle = Math.atan2(deltaY,deltaX)
        var Velocity = m.velocityInit + (m.deltaT * m.acceleration)
        if (speed == -1) {
            m.deltaT += 0.5 
            Velocity *= 0.5
        } else
        if (speed == 0) {
             m.deltaT += 1 
        } else if (speed == 1) {
            Velocity *= 2
             m.deltaT += 2
        } else if (speed == 2) {
             m.deltaT += 4
             Velocity *= 4
        } 
        
        if (m.maxDeltaT || m.maxDeltaT === 0) {
            if (m.maxDeltaT <= m.deltaT ) {
                m.useEngine = false;
               
             this.moveDone(main,1)   
            }
        }
        this.position.x += Math.abs(Velocity) * Math.cos(angle)
        
     this.position.y += Math.abs(Velocity) * Math.sin(angle)
    }
    calcMove(main,speed) { // if speed = 0, 0.05 sec, if speed = 1, 0.1 sec
         /*
         KINEMATICS:
         
         deltaX = Vinit * deltaT + (1/2)*A*deltaT^2
         Vfinal = Vinit + A*deltaT
         Vfinal^2 = Vinit^2 + 2*A*deltaX
         */
        var m = this.moveEngine
     
          var Velocity = m.velocityInit + (m.deltaT * m.acceleration)
             var dx = 0;
        if (speed == -1) {
            Velocity *= 0.5
             this.moveEngine.deltaT += 0.5
              dx = m.velocityInit + (1/2 * m.acceleration * 0.25) 
        } else 
          if (speed == 0) {
              
              this.moveEngine.deltaT += 1
             dx = m.velocityInit + (1/2 * m.acceleration) 
        } else if (speed == 1) {
             Velocity *= 2
            this.moveEngine.deltaT += 2
            dx = m.velocityInit * 2 + (1/2 * m.acceleration * 4)
        } else if (speed == 2) {
             Velocity *= 4
            this.moveEngine.deltaT += 4
             dx = m.velocityInit * 4 + (1/2 * m.acceleration * 16)
        } 
        
    
        this.moveEngine.deltaX += dx
        if (m.maxDeltaT || m.maxDeltaT === 0) {
            if (m.maxDeltaT <= m.deltaT ) {
                this.moveEngine.useEngine = false;
               
             this.moveDone(main,0)   
            }
        }
        
        if (m.maxDeltaX || m.maxDeltaX === 0) {
            if (m.maxDeltaX <= m.deltaX ) {
                this.moveEngine.useEngine = false;
             this.moveDone(main,0)   
            }
        }
    this.position.x += Math.abs(Velocity) * m.cos
     this.position.y += Math.abs(Velocity) * m.sin
     // console.log(this.position,m.angle)
     if (!m.useCurve) return;
        
        if (m.deltaT % 2) return
            
    var curve = m.deltaT * m.curveM + m.curveB;
        
        if (!curve) return;
        if (speed == -1) {
            curve *= 0.5
        } else 
        if (speed == 1) {
            curve *= 2
        } else if (speed == 2) {
            curve *= 4
        }
        m.deltaCurve += curve
        m.angle += curve * Math.PI / 180;
           var angle = m.angle * (180 / Math.PI);
        
        if (angle >= 360) 
            m.angle = (angle - 360) * (Math.PI / 180)
            m.sin = Math.sin(m.angle)
            m.cos = Math.cos(m.angle)
            if (!m.maxCurve) return;
        if (m.deltaCurve >= m.maxCurve) {
            m.useCurve = false;
        }
        
        
    }
 
  
  move(main,speed) { // Speed code:-1 = 0.25, 0 = 0.05, 1 = 0.1, 2 = 0.2
      if (this.moveEngine2.useEngine) this.calcMove2(main,speed)
    if (this.moveEngine.useEngine) this.calcMove(main,speed)
    

    this.checkGameBorders(main)
    main.updateHash(this)
   this.movCode()
    
  }
  
  
  
}
