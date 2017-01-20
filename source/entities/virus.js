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
module.exports = class Virus extends template {
    constructor(position, mass, type, owner, name) {
        super(position, mass, type, owner);

        this.color = {
            r: 0,
            g: 255,
            b: 0
        }
        this.fed = 0;
        this.type = 2;

        this.spiked = true;
        this.nearby = [];

    }
    feed(node, main) {

        /*
        Viruses have a completely different mech for OpenAgar. Instead of using the angle of the ejected mass, we get the point of collision and get the angle from that. The result? If you eject mass and it hits the edge of the virus, then it will travel the opposite direction. Like so
                  \   // the path of split one is relative to the position collision
                    \ 
                    ()
                     | // ejected mass hits edge of virus
        
        */

        node.eat(this, main)
        if (this.mass > main.getConfig().maxVirusMass) this.updateMass(main.getConfig().maxVirusMass)


        if (Math.random() < 0.8) this.fed++;
        if (this.fed > main.getConfig().virusFeedMin && main.viruses < main.getConfig().maxVirus) {
            var x1 = this.position.x,
                y1 = this.position.y,
                x2 = node.position.x,
                y2 = node.position.y

            var difx = x1 - x2
            var dify = y1 - y2
            var angle = Math.atan2(dify, difx)
            this.split(angle, main)
            this.fed = 0;
            this.updateMass(main.getConfig().virusMass)

        }

    }
    split(angle, main) {
        main.splitCell(this, angle, main.getConfig().virusSpeed, main.getConfig().virusDecay, main.getConfig().virusMass)
    }


    onDeletion(main) {
        main.viruses--;
    }
    onCreation(main) {
        main.viruses++;
    }
    getEatRange() {

        return this.size * -0.5;

    }
    collide(node, main) {
   this.eat(node, main);
        var split = main.getConfig().playerMaxCells - node.owner.cells.size;
       
           
        
        var defaultmass = ~~(node.mass / (split + 3))
        var big = defaultmass * 2 + (defaultmass / 2) // 2.5
        var medium = defaultmass / 2 + defaultmass // 1.5
        var angle = (Math.random() * 6.28318530718) // Math.floor(Math.random() * max) + min
        node.updateMass(big)
     

        // need to divide angle in order to spread them evenly
        // 360 degrees -> 2PI radians -> 6.28318530718
        var increment = 6.28318530718 / (split + 1) // want to add some randomness
        var g = ~~(split.length / 2)
        for (var i = 0; i < split; i++) {
            var mass = (i == 0) ? medium : defaultmass;
            var a = main.splitCell(node, angle, main.getConfig().splitSpeed, main.getConfig().splitDecay, mass)
            a.setMerge(main, main.getConfig().playerMerge, main.getConfig().playerMergeMult)
            main.getWorld().setFlags(a, "merge")
            main.getWorld().setFlags(node, "merge")
            angle += increment + (Math.random() * 0.03)
            if (angle > 6.28318530718) angle += -6.28318530718 // radians dims 0 < x < 2PI
        }

    }
    move(main, sp) {

        if (this.moveEngine2.useEngine) this.calcMove2(main, sp)
        if (this.moveEngine.useEngine) this.calcMove(main, sp);
        this.checkGameBorders(main)
        main.updateHash(this)
        this.movCode()


    }
};
