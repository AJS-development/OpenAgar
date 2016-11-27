"use strict"
var Child = require('child_process')
var QuickMap = require('quickmap')
module.exports = class childManager {
    constructor() {
        this.cpus = require('os').cpus()
        this.childs = new QuickMap();
        this.cid = 0
    }
    assignChild(sid) {
        if (this.childs.length < this.cpus.length) {
           var child = this.createNewChild()
            child.send({type:8,a:sid})
           return child
        } 
    var lowest = false;
        this.childs.forEach((child)=>{
        if (!lowest || child.assigned < lowest.assigned) lowest = child
        
    })
            if (!lowest) throw "ERR: Child was not found"
            lowest.assigned ++;
        lowest.send({type:8,a:sid})
            return lowest
        
            }
    deAssignChild(id,sid) {
        var child = this.childs.get(id)
        if (!child) throw "ERR: Cannot deassign child that doesnt exsist!"
        child.assigned --;
        child.send({type:8,da:sid})
        if (child.assign <= 0) {
            child.send({type:"stop"})
            this.childs.delete(id)
        }
        
    }
   
    getNextCID() {
        return this.cid ++;
    }
    createNewChild() {
        var child = Child.fork(__dirname + '/../child/index.js')
        var id = this.getNextCID()
        var data = {
            id: id,
            assigned: 1,
            child: child
        }
        this.childs.set(id,data)
        return data;
    }
    
}