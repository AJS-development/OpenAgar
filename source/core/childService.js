"use strict";
var Child = require('child_process')
module.exports = class childService {
  constructor() {
    this.cpus = require('os').cpus().length
    this.children = [];
    this.init()
  }
  init() {
      for (var i = 0; i < this.cpus; i ++) {
          Child.fork(__dirname + '/../child/index.js')
      }
  }
  
  
  
  
}
