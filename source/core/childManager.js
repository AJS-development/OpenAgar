"use strict"
var Child = require('child_process')
var QuickMap = require('quickmap')
var ChildHolder = require('./childHolder.js')
module.exports = class childManager {
    constructor() {
        this.cpus = require('os').cpus()
        this.childs = new QuickMap();
        this.cid = 0
    }
    assignChild(sid) {
        if (this.childs.length < this.cpus.length) {
           var child = this.createNewChild()
            child.assign(sid)
           return child
        } 
    var lowest = false;
        this.childs.forEach((child)=>{
        if (!lowest || child.assigned < lowest.assigned) lowest = child
        
    })
            if (!lowest) throw "ERR: Child was not found"
         
        lowest.assign(sid)
            return lowest
        
            }
    deAssignChild(id,sid) {
        var child = this.childs.get(id)
        if (!child) throw "ERR: Cannot deassign child that doesnt exsist!"
  
        child.deAssign(sid)
        if (child.assign <= 0) {
            child.stop()
            this.childs.delete(id)
        }
        
    }
   
    getNextCID() {
        return this.cid ++;
    }
    createNewChild() {
        var child = Child.fork(__dirname + '/../child/index.js')
        var id = this.getNextCID()
        var data = new ChildHolder(id,child)
        this.childs.set(id,data)
        return data;
    }
    
}