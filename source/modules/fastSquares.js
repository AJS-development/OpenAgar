"use strict"
var fs = require('fs')
module.exports = class FastSquares {
 constructor() {
   this.lib = [];
  this.init()
 }
 init() {
  try {
 this.lib = JSON.parse(fs.readFileSync(__dirname + "/squares.json","utf8"))
  } catch (e) {
 
for (var i = 0; i < 10000000; i ++) {
 this.lib[i] = Math.sqrt(i)
}
   fs.writeFileSync(__dirname + './squares.json',JSON.stringify(this.lib))
   console.log("Generated library")
  }
   sqrt(a) {
    return this.lib[~~a]
   }
 }
}
