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
module.exports = class CollisionHandler {
    constructor(main) {
        this.main = main;
        this.timer = 0;
    }
    collidePlayer(cell) {
        cell.nearby.forEach((node)=>{
            if (!node || node.dead) return;
            
            // relative collision
            if (node.type == 0 && node.owner == cell.owner) { 
                if (node.canMerge && cell.canMerge || node.getAge(this.main) < 500) return; 
                this.relativeCollision2(cell,node);
                 //this.relativeCollision2(cell,node);
            
            // rigid collision
            } else if (node.doesCollide(cell)) { 
                this.rigidCollision(cell,node);
            } 
        });
    }
    rigidCollision(cell,node) { // where one is stationary
        var dist = cell.getDistance(node.position.x,node.position.y)
    if (dist <= 1) return;
        
     var midpointx = (cell.position.x + node.position.x) / 2,
midpointy = (cell.position.y + node.position.y) / 2,
         x1 = midpointx + cell.size * (cell.position.x - node.position.x) / dist,
y1 = midpointy + cell.size * (cell.position.y - node.position.y) / dist,
x2 = midpointx + node.size * (node.position.x - cell.position.x) / dist, 
y2 = midpointy + node.size * (node.position.y - cell.position.y) / dist;
        
        cell.setPos(x1,y1)
        node.setPos(x2,y2)
    }
    relativeCollision2(cell,node) { // From multiogar SRC: https://github.com/Barbosik/MultiOgar/blob/master/src/GameServer.js
        
    // distance from cell1 to cell2
    var d = cell.getDistance(node.position.x,node.position.y)
    if (d <= 0) return;
    var invd = 1 / d;
    var dx = node.position.x - cell.position.x
    var dy = node.position.y - cell.position.y
    // normal
    var nx = dx * invd;
    var ny = dy * invd;
    var r = node.size + cell.size
    // body penetration distance
    var penetration = r - d;
    if (penetration <= 0) return;
    
    // penetration vector = penetration * normal
    var px = penetration * nx;
    var py = penetration * ny;
    
    // body impulse
        
        
        // cell1 = this
        // cell2 = node
        var cs1 = cell.size * cell.size
        var cs2 = node.size * node.size
    var totalMass = cs1 + cs2;
    if (totalMass <= 0) return;
    var invTotalMass = 1 / totalMass;
    var impulse1 = cs2 * invTotalMass;
    var impulse2 =cs1 * invTotalMass;
    
    // apply extrusion force

   
        
        cell.addPos(-px * impulse1,-py * impulse1)
 
        node.addPos(px * impulse2, py * impulse2)
       
    if (!node.moving) {
        node.checkGameBorders(this.main)
        node.movCode()
        
    }
    }
    relativeCollision(cell,node) { // considering mass
         var coll = cell.size + node.size;
         var dist = cell.getDistance(node.position.x,node.position.y)
         var angle = Math.atan(cell.getSlope(node.position.x,node.position.y))
 if (dist - coll > 0 || node == cell) return;
       var frac =  node.mass / cell.mass
        var a = Math.sqrt(frac) / 2;
        var push = a * (coll - dist);
    push = Math.min(push, coll - dist);
      
         cell.addPos(Math.sin(angle) * push,Math.cos(angle) * push)
         }
    
}