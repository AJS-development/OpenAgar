"use strict"
var fs = require('fs')
module.exports = class FastSquares {
 constructor() {
   this.lib = [];
  this.init()
 }
 init() {
  
 
for (var i = 0; i < 2000000; i ++) {
 this.lib[i] = Math.sqrt(i)
}
  
  
 }
   sqrt(a) {
   var a = this.lib[~~a]
   if (a === undefined) {
   return Math.sqrt(~~a)
   }
    return a
   }
 
}
