"use strict"

module.exports = class Template { // made gamemodes very alike ogar because then people will already know what to do
    constructor() {
    this.id = -1;
    this.name = "Template";
   
    }

onServerInit(data) { // Called when the server starts
  
    
}
onTick(data) { // Called at every 0.1s
    
}
onChange(data) {// Called when someone changes the gamemode via console commands

}

onPlayerInit(data) { // Called when a player joins a server

}

onPlayerSpawn(data) {  // Called when a player is spawned
 
      
}
pressQ(data) {  // Called when the Q key is pressed
 
      // returning nothing will make it use the default action, returning false will make it be disabled entirely
}

pressW(data) { // Called when the W key is pressed

   
}
pressSpace(data) { // Called when the Space bar is pressed
    
  
}
onCellAdd(data) {
    // Called when a player cell is added
}
onCellRemove(data) {
    // Called when a player cell is removed
}

updateLB(data) {
    // Called when the leaderboard update function is called
     
}
}