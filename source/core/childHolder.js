"use strict"

module.exports = class ChildHolder {
    constructor(id,child) {
        this.id = id;
        this.child = child;
      this.listeners = [];
        this.assigned = 0;
        this.init()
    }
    init() {
        this.child.on('message',function(msg) {
            if (this.listeners[msg.id]) this.listeners[msg.id](msg.data)
        }.bind(this))
    }
    send(id,data) {
        data.sid = id;
        try {
       
        this.child.send(data)
        
        } catch (e) {
            
        }
    }
    assign(sid) {
    
        this.assigned ++;
    this.child.send({type:8,a:sid})
    }
    deAssign(sid) {
        this.assigned --;
    }
    stop() {
         this.child.send({type:"stop"})
    }
    on(id,func) {
        this.listeners[id] = func
    }
}