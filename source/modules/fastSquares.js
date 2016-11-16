"use strict"
var fs = require('fs')
module.exports = class FastSquares {
 constructor() {
   this.lib = [];
  this.init()
 }
 init() {
  
 
for (var i = 0; i < 10000000; i ++) {
 this.lib[i] = Math.sqrt(i)
}
  
  
 }
   sqrt(a) {
    return this.lib[~~a]
   }
 
}
