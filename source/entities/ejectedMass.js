"use strict";
var template = require('./template.js');
module.exports = class EjectedMass extends template {
    constructor(position, mass, type, owner, other) {
        super(position, mass, type, owner, other);
        this.color = owner.gameData.color
        this.type = 3;
        this.viruses = [];
        this.up = false
        owner.owning.push(this)
    }
      move(main,speed) { // Speed code: 0 = 0.05, 1 = 0.1, 2 = 0.2
      if (this.moveEngine2.useEngine) this.calcMove2(main,speed)
    if (this.moveEngine.useEngine) this.calcMove(main,speed)
    

    this.checkGameBorders(main)
    this.checkVirus(main)
    main.updateHash(this)
    
   this.movCode()
    
  }
    checkVirus(main) {
        this.up = !this.up
        if (this.up)
       this.viruses = main.getWorld().getNodes('hash').getNodes(this.bounds)
        
       this.viruses.every((virus)=>{
           if (virus.type != 2) return true;
         
           if (!virus.collisionCheckCircle(this)) return true;
           virus.feed(this,main)
         
           return false
           
       })
    }
};
