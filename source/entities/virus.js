
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
module.exports = class virus extends template {
    constructor(position, mass, type, owner, name) {
        super(position, mass, type, owner);
       
        this.color = {
         r: 0,
          g: 255,
          b: 0
        }
        this.fed = 0;
        this.type = 4;

        this.moving = true;
        this.nearby = [];
      
    }
    feed(node) {
        
    }
   
    doesCollide(node,main) {
        return true;
        
    }
    
    
    
    move(main, sp) {
       
          if (this.moveEngine2.useEngine) this.calcMove2(main,sp)
          if (this.moveEngine.useEngine) this.calcMove(main,sp); this.moveToMouse(main,sp)
    
     
        
    }
};
