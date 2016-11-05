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
var template = require('./template.js');
module.exports = class cell extends template {
    constructor(position, mass, type, owner, name,mergeage) {
        super(position, mass, type, owner);
        this.name = owner.gameData.name;
        this.color = owner.gameData.color;
        this.mergeage = mergeage
        this.canMerge = false;
        this.type = 0;
       
        this.moving = true;
        this.nearby = [];
    }
    onCreation(main) {}
    onAdd(id) {
        this.id = id;
        this.owner.addCell(this);
    }
    onDeletion(main) {
        this.owner.removeCell(this);
    }
    
    
    moveToMouse(main,sp) {
  
        var speed = 0;
         if (sp == 0) {
         speed = this.speed
     } else if (sp == 1) {
         speed = this.speed * 2
     } else if (sp == 2) {
         speed = this.speed * 4
     }
          var mouse = this.owner.mouse,
    
        distx = mouse.x - this.position.x,
        disty = mouse.y - this.position.y,
        // y^2 = x^2 + b^2 -> y = sq(x^2 + b^2)
        dist = Math.floor(Math.sqrt(distx * distx + disty * disty));
        var angle = Math.atan2(disty,distx)
        if (!dist) return; // dont want 0
        // want cell to slow down as it gets closer to mouse
        var k = Math.min(Math.abs(dist),25) / 25, // max is 1
        // simplify and make x,y either be -1 or 1 or 0
        x = Math.cos(angle) * speed * k * main.getConfig().playerSpeed,
        y = Math.sin(angle) * speed * k * main.getConfig().playerSpeed;
       
        this.position.x += Math.round(x);
        this.position.y += Math.round(y);
       
    }
    move(main, sp) {
       
          if (this.moveEngine2.useEngine) this.calcMove2(main,sp)
          if (this.moveEngine.useEngine) this.calcMove(main,sp); this.moveToMouse(main,sp)
    
     
        
    }
};
