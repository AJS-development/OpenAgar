"use strict";
var template = require('./template.js');
module.exports = class cell extends template {
    constructor(position, mass, type, owner, other) {
        super(position, mass, type, owner, other);
    }
};
