"use strict";
var template = require('./template.js');
module.exports = class food extends template {
    constructor(position, mass, type, owner, other) {
        super(position, mass, type, owner, other);
        this.type = 4;
    }
    onDeletion(main) {
        main.food --;
    }
    onCreation(main) {
        main.food ++;
    }
    getEatRange() {
   
     return this.size * -0.4;   
    
   }
};
