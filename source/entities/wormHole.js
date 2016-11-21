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
module.exports = class wormhole extends template {
    constructor(position, mass, type, owner, name) {
        super(position, mass, type, owner);
       
        this.color = {
         r: 0,
          g: 0,
          b: 0
        }
        this.fed = 0;
        this.type = 6;

        
        this.nearby = [];
      
    }
    feed(node,main) {

    }
  
    doesCollide(node,main) {
        return true;
        
    }
    
     onDeletion(main) {
    
    }
    onCreation(main) {
    
    }
     getEatRange() {

        return this.size * -0.5;  
    
   }
    collide(node,main) {
   
    }
    move(main, sp) {
       
          if (this.moveEngine2.useEngine) this.calcMove2(main,sp)
          if (this.moveEngine.useEngine) this.calcMove(main,sp); 
     this.checkGameBorders(main)
    main.updateHash(this)
   this.movCode()
     
        
    }
};
