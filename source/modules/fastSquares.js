// No license here! This is free to the public!

"use strict"

module.exports = class FastSquares {
 constructor() {
   this.lib = [];
  this.init()
 }
 init() {
  
 
for (var i = 0; i < 1000000; i ++) {
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
