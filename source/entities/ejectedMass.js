"use strict";
var template = require('./template.js');
module.exports = class EjectedMass extends template {
    constructor(position, mass, type, owner, other) {
        super(position, mass, type, owner, other);
        this.color = owner.gameData.color
        this.type = 3;
    }
    
};