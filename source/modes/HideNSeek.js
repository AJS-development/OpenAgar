"use strict"
var template = require('./template.js');
module.exports = class HideNSeek extends template {
    constructor() {
        super()
        this.id = 4;
        this.name = "Hide and Seek";
        this.state = 0; // 0=accepting players, 1=starting, 2 = started, 3 = done
        this.players = 0;
        this.required = 20
        this.t = 0;
    }
    onServerInit(data) {
        var main = data.main;

        main.formatNode = function (node, player) { // override to prevent cheat scripts

            var a = {
                id: node.id,
                owId: (node.owner && node.owner == player) ? node.owner.id : 0,
                size: node.size,
                mass: node.mass,
                type: (node._type) ? node._type : node.type,
                posX: node.position.x,
                posY: node.position.y,
                color: node.color
            };
            node.name && (a.name = node.name)
            node.agit && (a.agit = 1)
                //  node.skin && (a.skin = player.skinHandler.getSend(node.skin))

            node.spiked && (a.spiked = 1);
            return a;
        }
        main._split = main.splitPlayer;
        main.splitPlayer = function (player) { // teleport
            if (player.team == 1) return this._split(player);
            if (player.entity != 2) return;
            if (!player.lastJump || this.timer.time - player.lastJump >= 120000) {
                player.lastJump = this.timer.time;
                var pos = this.foodService.getRandomPos();
                player.cells.forEach((c) => {
                    c.position.x = pos.x;
                    c.position.y = pos.y;

                })


            }


        }
        main.canEject = function (client) {

            if (client.team == 0 && client.entity != 1) return false;
            var cool = (client.entity == 1) ? 1100 : this.getConfig().ejectMassCooldown;
            if (!client.lastEject || this.getConfig().ejectMassCooldown == 0 || this.timer.time - client.lastEject >= cool) {
                client.lastEject = this.timer.time;
                return true;
            }
            return false;
        }
        main.ejectCheck = function (cell) {
            if (cell.owner.team == 0 && cell.owner.entity == 1) return true;
            if (cell.mass < this.getConfig().ejectMassMin) return false;
            cell.addMass(-this.getConfig().ejectedMass);
            return true;
        }
        this.setup(data)
    }
    setup(data) {
        data.main.pause(true)
        this.players = 0;
        data.main.reset();
        this.state = 0;

    }
    onAllAdd(data) {
        var main = data.main,
            cell = data.cell;

    }
    onAllInit(data) {
        var main = data.main,
            player = data.player;
        player.team = (this.t++) % 2 // 0 = hider, 1 = seeker

    }
    onCellAdd(data) {
        var cell = data.cell,
            main = data.main,
            player = cell.owner;
        if (player.team) {
            cell.color = {
                r: 255,
                g: 255,
                b: 14
            }

            cell.name = 'Seeker';
            cell.moveToMouse = function (main, sp) {

                var speed = 0;
                if (sp == 0) {
                    speed = this.speed * 2
                } else if (sp == 1) {
                    speed = this.speed * 3
                } else if (sp == 2) {
                    speed = this.speed * 5
                }
                var mouse = this.owner.mouse,

                    distx = mouse.x - this.position.x,
                    disty = mouse.y - this.position.y,
                    // y^2 = x^2 + b^2 -> y = sq(x^2 + b^2)
                    num = Math.min(distx * distx + disty * disty, 625),

                    dist = ~~(Sqrt.sqrt(num));

                var angle = Math.atan2(disty, distx)
                if (!dist) return; // dont want 0
                // want cell to slow down as it gets closer to mouse
                var k = Math.min(Math.abs(dist), 25) / 25, // max is 1
                    p = speed * k * main.getConfig().playerSpeed,
                    x = Math.cos(angle) * p,
                    y = Math.sin(angle) * p;
                //  console.log((speed * k * main.getConfig().playerSpeed)/50)
                this.position.x += Math.round(x);
                this.position.y += Math.round(y);

            }
            return;
        }
        cell.canEat = function (ch, m) {


            if (this._type == 2 && ch.type == 0 && ch.owner.team == 1) return true;
            return false;
        }
        cell.doesCollide = function (check, main) {
            if (this.owner.team == 0 && this.size < check.size) return true;
            return false;
        }
        switch (player.entity) {
        case 0: // virus (2). Can eat seekers
            cell._type = 2;

            cell.mass = main.getConfig().virusMass;
            cell.color = {
                r: 0,
                g: 255,
                b: 0
            }

            cell.spiked = true;
            break;
        case 1: // ejectedmass (3). Can eject 1 ejectmass every second to confuse seekers
            cell._type = 3;
            cell.mass = main.getConfig().ejectedMass;

            break;
        case 2: // Wormhole (6). Can teleport (space) every 2 minutes
            cell._type = 6;
            cell.mass = Math.floor(Math.random() * 500) + 100;
            cell.color = {
                r: 0,
                g: 0,
                b: 0
            }
            cell.agit = true;
            break;
        case 3: // Food (4). Really small and fast (rare)
            cell._type = 4;
            cell.updateMass(2, true);
            break;
        }


    }
    start(data) {
        data.main.pause(false);
        data.main.clients.forEach((c) => {
            var a = (c.team) ? "seeker!" : "hider!";
            c.msg("Game started! You are a " + a)
        })
    }
    onPlayerSpawn(data) {
        if (this.state != 0) {
            if (data.player.team == 0) {
                data.player.team = 1;
                return true;
            }
            data.player.msg("The game is full!");
            return false;
        }
        this.players++;
        var main = data.main,
            player = data.player;
        if (player.team == 1) return;
        player.entity = Math.floor(Math.random() * 3) // 0= virus, 1 = ejectedmass, 2=wormhole,3=food  
        player.msg("You have joined the game! Waiting for " + (this.required - this.players) + " players");
        main.clients.forEach((c) => {
            if (c == player) return;
            c.msg("Waiting for " + (this.required - this.players) + " players");
        })
    }
    onDeath(player) {
        if (this.state == 0) this.players--;
    }
    onCellRemove(data) {

        var cell = data.cell,
            main = data.main;

        if (cell.owner.cells.size <= 0) this.onDeath(cell.owner);
    }

    updateLB(data) {
        var main = data.main;

        var seekers = 0,
            hiders = 0,
            viruses = 0,
            ejected = 0,
            worm = 0,
            food = 0;
        main.loopPlayers((player) => {

        })
        return false;
    }

}