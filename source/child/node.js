"use strict";

module.exports = class Node {
    constructor(node, owner) {
        this.type = node.type;
        this.position = node.position;
        this.bounds = null;
        this.id = node.id;
        this.owner = owner
        this.size = node.size;
        this.speed = node.speed

        this.mass = node.mass;

        this.destroyed = false;
        this.init()

    }

    init() {

        if (this.owner) {
            this.owner.addCell(this)
        }
    }
    getCheck() { // get checking bounds
        var dif = Math.min(100 / this.size, 1) * 100; // smaller nodes have bigger collision range since they go faster.

        return {
            x: this.bounds.x - dif,
            y: this.bounds.y - dif,
            width: this.bounds.width + dif,
            height: this.bounds.height + dif

        }

    }



    checkSend(node) {
        var size = node.size + this.size + (Math.min(100 / this.size, 1.1) * 100) // smaller nodes have bigger collision range since they go faster. Fine tunes previous check.

        /*
 ____________________________________
/ I tried to make a flowchart, but I \
\ failed.                            /
 ------------------------------------
  \
   \

     [-]
     (+)=C
     | |
     OOO
        
        
        */

        var x = this.position.x - node.position.x
        var y = this.position.y - node.position.y
        return (size * size >= x * x + y * y)
    }
    set(node) {
        this.type = node.type || this.type;
        this.position = node.position || this.position;
        this.bounds = node.bounds || this.bounds;

        this.size = node.size || this.size;


        this.mass = node.mass || this.mass;
        this.speed = node.speed || this.speed
    }
    getSize() {
        return this.mass
    }
    onDelete(main) {
        if (this.owner) this.owner.removeCell(this)
    }



}