"use strict";

module.exports = class BotAi {
    constructor(player) {
        this.player = player;
        this.gameState = 0;
        this.path = [];

        this.predators = []; // List of cells that can eat this bot
        this.threats = []; // List of cells that can eat this bot but are too far away
        this.prey = []; // List of cells that can be eaten by this bot
        this.food = [];
        this.rbuffer = 10;
        this.foodImportant = []; // Not used - Bots will attempt to eat this regardless of nearby prey/predators
        this.virus = []; // List of viruses
        this.teamingwith = []; // player teamingwith
        this.teamStage = 0; // stage of teaming. 0 = off, 1 = init (shaking and giving mass), 2 = teamenabled, 3 = betrayal

        this.juke = true;


        this.target;
        this.teameject = 0;
        this.shake = 0;
        this.teamtimout = 30 // timout until team is gone
        this.targetVirus; // Virus used to shoot into the target
        this.updateIn = (Math.random() * 12) >> 0;
        this.ejectMass = 0; // Amount of times to eject mass
        this.oldPos = {
            x: 0,
            y: 0
        };
    }
    getLowestCell() {
        // Gets the cell with the lowest mass
        if (this.player.cells.length <= 0) {
            return null; // Error!
        }

        // Starting cell
        var lowest = this.player.cells[0];
        for (let i = 1; i < this.player.cells.length; i++) {
            if (lowest.mass > this.player.cells[i].mass) {
                lowest = this.player.cells[i];
            }
        }
        return lowest;
    }
    clearLists() {
        this.predators = [];
        this.threats = [];
        this.prey = [];
        this.food = [];
        this.virus = [];
        this.juke = false;
    }
    update() {
        var cell = this.getLowestCell();
        if (cell) {
            var r = cell.size
        } else {
            var r = 0;
        }
        this.clearLists();
        var ignoreMass = cell.mass / 25;
        this.player.nodes.forEach((check) => {
            // Cannot target itself
            if ((!check) || (cell.owner == check.owner)) {
                return;
            }

            var t = check.type;
            switch (t) {
            case 0:
                // Cannot target teammates
                if (this.player.server.haveTeams) {
                    if (check.owner.team == this.player.team) {
                        return;
                    }
                }

                var random = Math.floor(Math.random() * 500);
                if (check.owner && random < 5 && Math.abs(check.owner.getScore() - this.player.getScore()) < 200 && this.teamStage == 0) {
                    this.teamStage = 1;
                    this.teamingwith = check.owner;
                    this.teameject = 0;
                }

                // Check for danger
                if (cell.mass > (check.mass * 1.3) && check.owner != this.teamingwith) {
                    // Add to prey list
                    this.prey.push(check);
                } else if (check.mass > (cell.mass * 1.3) && check.owner != this.teamingwith) {
                    // Predator
                    var dist = this.getDist(cell, check) - (r + check.size);
                    if (dist < 300) {
                        this.predators.push(check);
                        if ((this.player.cells.length == 1) && (dist < 0)) {
                            this.juke = true;
                        }
                    }
                    this.threats.push(check);
                } else if (check.owner != this.teamingwith) {
                    this.threats.push(check);
                }
                break;
            case 2: // Virus
                this.virus.push(check);
                // Can also be a threat
                if (cell.mass > (check.mass * 1.3)) {
                    if (dist < 40) {
                        this.threats.push(check);
                        this.predators.push(check);
                    }
                }
                break;
            case 3: // Ejected mass
                if (cell.mass > 20) {
                    this.food.push(check);
                }
                break;
            case 4:
                this.food.push(check);
                break;
            default:
                break;
            }
        })

        var newState = this.getState(cell);
        if ((newState != this.gameState) && (newState != 4)) {
            // Clear target
            this.target = null;

        }
        this.gameState = newState;

        // Action
        this.decide(cell);
    }
    getState(cell) {
        // Continue to shoot viruses
        if (this.gameState == 4) {
            return 4;
        }
        if (this.teamStage == 1) {
            return 6;
        }

        // Check for predators
        if (this.predators.length <= 0) {
            if (this.prey.length > 0) {
                return 3;
            } else if (this.food.length > 0) {
                return 1;
            }
        } else if (this.threats.length > 0) {
            if ((this.player.cells.length == 1) && (cell.mass > 180)) {
                var t = this.getBiggest(this.threats);
                var tl = this.findNearbyVirus(t, 500, this.virus);
                if (tl != false && t.type !== 2) {
                    this.target = t;
                    this.targetVirus = tl;
                    return 4;
                } else {
                    // Run if we hit a virus
                    return 2;
                }
            } else {
                // Run
                return 2;
            }
        }

        // Bot wanders by default
        return 0;

    }
    decide(cell) {
        // The bot decides what to do based on gamestate

        switch (this.gameState) {
        case 0: // Wander



            //console.log("[Bot] "+cell.getName()+": Wandering");
            if ((this.player.center.x == this.player.mouse.x) && (this.player.center.y == this.player.mouse.y)) {
                // Get a new position


                var randomNode = this.player.nodes[Math.floor(Math.random() * this.player.nodes.length)]
                var pos = {
                    x: 0,
                    y: 0
                };

                if ((randomNode.type == 3) || (randomNode.type == 4)) {
                    pos.x = randomNode.position.x;
                    pos.y = randomNode.position.y;
                } else {
                    // Not a food/ejected cell
                    pos = this.player.getRandom();
                }

                // Set bot's mouse coords to this location
                this.player.mouse = {
                    x: pos.x,
                    y: pos.y
                };
                this.player.send = true;
            }

            break;
        case 1: // Looking for food

            //console.log("[Bot] "+cell.getName()+": Getting Food");
            this.target = this.findNearest(cell, this.food);

            this.player.mouse = {
                x: this.target.position.x,
                y: this.target.position.y
            };
            this.player.send = true;

            break;
        case 2: // Run from (potential) predators
            var avoid = this.combineVectors(this.predators);
            //console.log("[Bot] "+cell.getName()+": Fleeing from "+avoid.getName());

            // Find angle of vector between cell and predator
            var deltaY = avoid.y - cell.position.y;
            var deltaX = avoid.x - cell.position.x;
            var angle = Math.atan2(deltaX, deltaY);

            // Now reverse the angle
            angle = this.reverseAngle(angle);

            // Direction to move
            var x1 = cell.position.x + (500 * Math.sin(angle));
            var y1 = cell.position.y + (500 * Math.cos(angle));

            this.player.mouse = {
                x: x1,
                y: y1
            };
            this.player.send = true;

            // Cheating
            //if (cell.mass < 250) {
            //cell.mass += 1;
            //}

            if (this.juke) {
                // Juking
                this.player.splitCells();
            }

            break;
        case 3: // Target prey

            if ((!this.target) || (cell.mass < (this.target.mass * 1.3)) || (this.player.nodes.indexOf(this.target) == -1)) {
                this.target = this.getBiggest(this.prey);
            }
            //console.log("[Bot] "+cell.getName()+": Targeting "+this.target.getName());

            this.player.mouse = {
                x: this.target.position.x,
                y: this.target.position.y
            };
            this.player.send = true;
            var massReq = 1.3 * (this.target.mass * 2); // Mass required to splitkill the target

            if ((cell.mass > massReq) && (this.player.cells.length <= this.player.server.config.botMaxSplit)) { // Will not split into more than 2 cells
                var splitDist = (20 * (cell.speed * 5)) + (cell.size * 1.75); // Distance needed to splitkill
                var distToTarget = this.getAccDist(cell, this.target); // Distance between the target and this cell

                if (splitDist >= distToTarget) {
                    if ((this.threats.length > 0) && (this.getBiggest(this.threats).mass > (cell.mass))) {
                        // Dont splitkill when there are cells that can possibly eat you after the split
                        break;
                    }
                    // Splitkill
                    this.player.splitCells(this);
                }
            }

            break;
        case 4: // Shoot virus

            if ((!this.target) || (!this.targetVirus) || (!this.player.cells.length == 1) || (this.player.nodes.indexOf(this.target) == -1) || (this.player.nodes.indexOf(this.targetVirus) == -1)) {
                this.gameState = 0; // Reset
                this.target = null;
                break;
            }

            // Make sure target is within range
            var dist = this.getDist(this.targetVirus, this.target) - (this.target.size + 100);
            if (dist > 500) {
                this.gameState = 0; // Reset
                this.target = null;
                break;
            }

            // Find angle of vector between target and virus
            var angle = this.getAngle(this.target, this.targetVirus);

            // Now reverse the angle
            var reversed = this.reverseAngle(angle);

            // Get this bot cell's angle
            var ourAngle = this.getAngle(cell, this.targetVirus);

            // Check if bot cell is in position
            if ((ourAngle <= (reversed + .25)) && (ourAngle >= (reversed - .25))) {
                // In position!
                this.player.mouse = {
                    x: this.targetVirus.position.x,
                    y: this.targetVirus.position.y
                };
                this.player.send = true;
                // Shoot
                for (var v = 0; v < 7; v++) {
                    this.player.ejectMass();
                }

                // Back to starting pos
                this.player.mouse = {
                    x: cell.position.x,
                    y: cell.position.y
                };
                this.player.send = true;
                // Cleanup
                this.gameState = 0; // Reset
                this.target = null;
            } else {
                // Move to position
                var r = cell.size;
                var x1 = this.targetVirus.position.x + ((350 + r) * Math.sin(reversed));
                var y1 = this.targetVirus.position.y + ((350 + r) * Math.cos(reversed));
                this.player.mouse = {
                    x: x1,
                    y: y1
                };
                this.player.send = true;
            }

            // console.log("[Bot] "+cell.getName()+": Targeting (virus) "+this.target.getName());

            break;
        case 6: // init team
            if (this.teamtimout < 1) {
                this.teamtimout = 30;
                this.teamStage = 0;
                this.teameject = 0;
                // console.log("team timeout");
            } else {
                this.teamtimout--;
            }
            var ok = false;
            for (var i in this.teamingwith.cells) {

                var des = this.getAccDist(cell, this.teamingwith.cells[i])

                if (des < 100 + this.teamingwith.cells[i].mass) {
                    var avoid = this.teamingwith.cells[i].position
                        //console.log("[Bot] "+cell.getName()+": Fleeing from "+avoid.getName());

                    // Find angle of vector between cell and predator
                    var deltaY = avoid.y - cell.position.y;
                    var deltaX = avoid.x - cell.position.x;
                    var angle = Math.atan2(deltaX, deltaY);

                    // Now reverse the angle
                    angle = this.reverseAngle(angle);

                    // Direction to move
                    var x1 = cell.position.x + (500 * Math.sin(angle));
                    var y1 = cell.position.y + (500 * Math.cos(angle));

                    this.player.mouse = {
                        x: x1,
                        y: y1
                    };
                    this.player.send = true;
                }
                if (des < 700 + this.teamingwith.cells[i].mass) {
                    var ok = true;
                    // console.log("ok true")
                    break;
                }
            }
            if (ok) {
                if (this.teameject < 5 && cell.mass > 100) {
                    if (this.teamingwith.cells[0]) this.player.mouse = this.teamingwith.cells[0].position;
                    this.player.send = true;
                    this.player.ejectMass();
                    // console.log("ejecting");
                    this.teameject++
                }

            } else {
                if (this.teamingwith.cells[0]) this.player.mouse = this.teamingwith.cells[0].position;
                this.player.send = true;
            }

            break;
        default:

            //console.log("[Bot] "+cell.getName()+": Idle "+this.gameState);
            this.target = this.findNearest(cell, this.food);

            this.player.mouse = {
                x: this.target.position.x,
                y: this.target.position.y
            };
            this.player.send = true;
            this.gameState = 1;

            break;
        }



    }
    findNearest(cell, list) {
        if (this.currentTarget) {
            // Do not check for food if target already exists
            return null;
        }

        // Check for nearest cell in list
        var shortest = list[0];
        var shortestDist = this.getDist(cell, shortest);
        for (var i = 1; i < list.length; i++) {
            var check = list[i];
            var dist = this.getDist(cell, check);
            if (shortestDist > dist) {
                shortest = check;
                shortestDist = dist;
            }
        }

        return shortest;
    }
    getRandom(list) {
        // Gets a random cell from the array
        var n = Math.floor(Math.random() * list.length);
        return list[n];
    }
    combineVectors(list) {
        // Gets the angles of all enemies approaching the cell
        var pos = {
            x: 0,
            y: 0
        };
        var check;
        for (var i = 0; i < list.length; i++) {
            check = list[i];
            pos.x += check.position.x;
            pos.y += check.position.y;
        }

        // Get avg
        pos.x = pos.x / list.length;
        pos.y = pos.y / list.length;

        return pos;
    }
    checkPath(cell, check) {
        // Checks if the cell is in the way

        // Get angle of vector (cell -> path)
        var v1 = Math.atan2(cell.position.x - this.player.mouse.x, cell.position.y - this.player.mouse.y);

        // Get angle of vector (virus -> cell)
        var v2 = this.getAngle(check, cell);
        v2 = this.reverseAngle(v2);

        if ((v1 <= (v2 + .25)) && (v1 >= (v2 - .25))) {
            return true;
        } else {
            return false;
        }
    }

    getBiggest(list) {
        // Gets the biggest cell from the array
        var biggest = list[0];
        for (var i = 1; i < list.length; i++) {
            var check = list[i];
            if (check.mass > biggest.mass) {
                biggest = check;
            }
        }

        return biggest;
    }

    findNearbyVirus(cell, checkDist, list) {
        var r = cell.size + 100; // Gets radius + virus radius
        for (var i = 0; i < list.length; i++) {
            var check = list[i];
            var dist = this.getDist(cell, check) - r;
            if (checkDist > dist) {
                return check;
            }
        }
        return false; // Returns a bool if no nearby viruses are found
    }


    getDist(cell, check) {
        // Fastest distance - I have a crappy computer to test with :(
        var xd = (check.position.x - cell.position.x);
        xd = xd < 0 ? xd * -1 : xd; // Math.abs is slow

        var yd = (check.position.y - cell.position.y);
        yd = yd < 0 ? yd * -1 : yd; // Math.abs is slow

        return (xd + yd);
    }

    getAccDist(cell, check) {
        // Accurate Distance
        var xs = check.position.x - cell.position.x;
        xs = xs * xs;

        var ys = check.position.y - cell.position.y;
        ys = ys * ys;

        return Math.sqrt(xs + ys);
    }

    getAngle(c1, c2) {
        var deltaY = c1.position.y - c2.position.y;
        var deltaX = c1.position.x - c2.position.x;
        return Math.atan2(deltaX, deltaY);
    }

    reverseAngle(angle) {
        if (angle > Math.PI) {
            angle -= Math.PI;
        } else {
            angle += Math.PI;
        }
        return angle;
    }

}