// No license here! This is free to the public!

// Use: A faster alternative to Math.sqrt()

/*
How to use:

var a = require('path to fastsquares')
Sqrt = new a()

Then you can use this anywhere in your code by doing 

Sqrt.sqrt(num)

*/

"use strict"

module.exports = class FastSquares {
 constructor() {
   this.lib = [];
  this.init()
 }
 init() {
  
 
for (var i = 0; i < 1000000; i ++) {
 this.lib.push(Math.sqrt(i))
}
  
  
 }
   sqrt(a) {
   var b = this.lib[~~a]
   if (b === undefined) {
   return Math.sqrt(~~a)
   }
    return b
   }
 
}
