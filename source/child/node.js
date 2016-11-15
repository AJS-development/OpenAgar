"use strict";

module.exports = class Node {
    constructor(node,owner) {
        this.type = node.type;
        this.position = node.position;
        this.bounds = node.bounds;
        this.id = node.id;
        this.owner = owner
        this.size = node.size;
      

        this.mass = node.mass;
        
        this.destroyed = false;
        this.init()
        
    }
    init() {
      
        if (this.owner) {
            this.owner.addCell(this)
        }
    }
    set(node) {
       this.type = node.type || this.type;
        this.position = node.position || this.position;
        this.bounds = node.bounds || this.bounds;
      
        this.size = node.size || this.size;
 
  
        this.mass = node.mass || this.mass; 
    }
    getSize() {
        return this.mass
    }
    onDelete(main) {
       if (this.owner) this.owner.removeCell(this)
    }
    
    
    
}
