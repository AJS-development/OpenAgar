"use strict"
/*
    OpenAgar - Open source web game
    Copyright (C) 2016 Andrew S

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var template = require('./template.js');
module.exports = class HideNSeek extends template {
    constructor() {
        super()
        this.id = 4;
        this.name = "Hide and Seek";
        this.state = 0; // 0=accepting players, 1=starting, 2 = started, 3 = done
        this.players = 0;
        this.required = 20;
        this.seekers = 0;
        this.hiders = 0;

        this.dead = 0;
    }
    onServerInit(data) {

        var main = data.main;
        main.getConfig().playerMergeMult = 0.01;
        main.getConfig().playerMerge = 0;
        main.setInterval(function () {
            this.update(data)
        }.bind(this), 1000)
        main.formatNode = function (node, player) { // override to prevent cheat scripts
            var a = {
                id: node.id,
                owId: (node.owner && node.owner == player) ? node.owner.id : 0,
                size: node.size,
                mass: node.mass,
                type: (node._type) ? node._type : node.type,
                posX: node.position.x,
                posY: node.position.y,
                color: node.color,
                name: (node.name) ? node.name : "",
                spiked: (node.spiked) ? 1 : 0,
                agit: (node.agit) ? 1 : 0,
                skin: ""
            };
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
        this.hiders = 0;
        this.seekers = 0;
        this.dead = 0;
        data.main.loopPlayers((p) => {
            p.team = false
            p.entity = false
        })

    }
    onAllAdd(data) {
        var main = data.main,
            cell = data.cell;

    }
    initPlayer(data) {
        var main = data.main,
            player = data.player;
        var team

        if (this.seekers < this.hiders) {
            if (this.seekers >= 7) {
                team = 0;
            } else {
                team = 1;
            }
        } else {
            team = 0;
        }
        if (team) this.seekers++;
        else this.hiders++;
        player.team = team; // 0 = hider, 1 = seeker

    }
    onCellAdd(data) {
        var cell = data.cell,
            main = data.main,
            player = cell.owner;

        cell.name = "";

        if (player.team) {
            cell.color = {
                r: 255,
                g: 255,
                b: 14
            }

            cell.name = 'Seeker';
            cell.updateMass(50)
            cell.moveToMouse = function (main, sp) {

                var speed = 0;
                if (sp == 0) {
                    speed = this.speed * 2.1
                } else if (sp == 1) {
                    speed = this.speed * 3.1
                } else if (sp == 2) {
                    speed = this.speed * 5.1
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

            cell.canEat = function (ch, m) {

                if (ch.type == 0 && ch.owner.team == 1)
                    return false;
                return true;
            }
            cell.doesCollide = function () {
                return false;
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
        this.cloak(player, cell, main)

    }
    cloak(player, cell, main) {
        switch (player.entity) {
        case 0: // virus (2). Can eat seekers
            cell._type = 2;


            cell.color = {
                r: 0,
                g: 255,
                b: 0
            }

            cell.spiked = true;
            cell.updateMass(main.getConfig().virusMass);
            break;
        case 1: // ejectedmass (3). Can eject 1 ejectmass every second to confuse seekers
            cell._type = 3;
            cell.updateMass(main.getConfig().ejectedMass);

            break;
        case 2: // Wormhole (6). Can teleport (space) every 2 minutes
            cell._type = 6;

            cell.color = {
                r: 0,
                g: 0,
                b: 0
            }
            cell.agit = true;
            cell.updateMass(Math.floor(Math.random() * 500) + 100);
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
            c.msg("Game started! You are a " + a);
            if (c.team == 0) {
                switch (c.entity) {
                case 0:
                    c.msg("You are a virus! You can eat seekers!");
                    break;
                case 1:
                    c.msg("You are a Ejected Mass! You can shoot another ejected mass every second!");
                    break;
                case 2:
                    c.msg("You are a wormhole! You can teleport by pressing space every 2 minutes!");
                    break;
                case 3:
                    c.msg("You are food! You can move very fast!");
                    break;
                }
            }
        })

    }

    stop(data, hiders, seekers) {
        this.remain = 10;
        this.state = 3;
        if (hiders < seekers) {
            this.broadCast("The seekers have won the game!", data.main);
            this.win = {
                color: "#60ef40",
                text: "Seekers win!"
            }
        } else if (seekers < hiders) {
            this.broadCast("The hiders have won the game!", data.main);

            this.win = {
                color: "#efe440",
                text: "Draw!"
            }
        } else {
            this.broadCast("It is a draw!", data.main);
            this.win = {
                color: "#60ef40",
                text: "Hiders win!"
            }
        }

    }
    onPlayerSpawn(data) {
        var main = data.main,
            player = data.player;
        if (this.state != 0) {
            if (player.team === 0) {
                player.team = 1;
                return true;
            }
            player.msg("The game has started! You must wait to join!");
            return false;
        }
        if (player.team == false || player.team == undefined) this.initPlayer(data);
        this.players++;

        if (player.team == 1) return;
        player.entity = Math.floor(Math.random() * 3.25) // 0= virus, 1 = ejectedmass, 2=wormhole,3=food  
        player.msg("You have joined the game! Waiting for " + (this.required - this.players) + " players");
        main.clients.forEach((c) => {
            if (c == player) return;
            c.msg("Waiting for " + (this.required - this.players) + " players");
        })
    }
    onDeath(player) {
        if (this.state == 0) return this.players--;

        if (player.team) this.dead++;

    }
    broadCast(msg, main) {
        main.clients.forEach((player) => {
            player.msg(msg)
        })
    }
    onCellRemove(data) {

        var cell = data.cell,
            main = data.main;

        if (cell.owner.cells.size <= 0) this.onDeath(cell.owner);
    }
    show(data) {
        this.broadCast("Hiders are visible for 5 seconds!", data.main);
        data.main.getWorld().getNodes('player').forEach((m) => {
            if (m.owner.team == 0) {
                m.color = {
                    r: 255,
                    g: 0,
                    b: 0
                }
                m.name = "Hider"

                m.agit = false;
                m.spiked = false;
                m._type = false;
                m.updateMass(25);
            }
        })
        data.main.setTimeout(function () {

            data.main.getWorld().getNodes('player').forEach((m) => {
                if (m.owner.team == 0) {
                    this.cloak(m.owner, m, data.main);
                    m.name = "";

                    m.updCode();
                }
            })
        }.bind(this), 5000)
    }
    update(data) {
        var main = data.main;
        var dt = [];
        switch (this.state) {
        case 0:
            dt[0] = {

                color: "#16e0e0",
                text: "Waiting for players..."
            };
            dt[1] = {
                color: "#63e016",
                text: this.players + "/" + this.required
            }
            if (this.players >= this.required) {
                this.state = 1;

                this.broadCast("Starting game in:", main)

                this.st = 10;

            }
            break;
        case 1:
            dt[0] = {
                color: "#0e5ced",
                text: "Starting game in"

            }
            dt[1] = {
                color: (this.st <= 4) ? "#ed240e" : "#37ed0e",
                text: this.st.toString()
            }
            this.broadCast(this.st.toString(), main);


            if (this.st <= 0) {
                this.state = 2;
                this.remain = 330;
                this.start(data)
            }
            this.st--;

            break;
        case 2:
            var seekers = 0,
                hiders = 0,
                viruses = 0,
                ejected = 0,
                worm = 0,
                food = 0;
            main.loopPlayers((player) => {
                if (player.cells.size <= 0) return;
                if (player.team == 1) {
                    seekers++;
                    return;
                }
                hiders++;
                switch (player.entity) {
                case 0:
                    viruses++;

                    break;
                case 1:
                    ejected++;
                    break;
                case 2:
                    worm++;
                    break;
                case 3:
                    food++;
                    break;
                }
            })
            dt[0] = {
                color: (hiders <= 4) ? "#ed240e" : "#37ed0e",
                text: "Hiders: " + hiders
            }
            dt[1] = {
                color: (seekers <= 4) ? "#ed240e" : "#37ed0e",
                text: "Seekers: " + seekers
            }
            dt[2] = {
                color: "#b7b6a7",
                text: "Dead: " + this.dead
            }
            dt[3] = {
                color: "#000000",
                text: "================"
            }
            dt[4] = {
                color: "#d6d5c5",
                text: "Time remaining:"
            }
            var min = Math.floor(this.remain / 60);
            var sec = this.remain - (min * 60);
            dt[5] = {
                color: (this.remain < 10) ? "#ed240e" : "#d6d5c5",
                text: min + ":" + sec
            }

            if (this.remain <= 0 || (this.players - this.dead) <= 0 || hiders <= 0 || seekers <= 0) this.stop(data, hiders, seekers)
            if (!(this.remain % 120)) this.show(data)
            this.remain--;
            break;
        case 3:
            dt[0] = this.win;
            dt[1] = {
                color: "#000000",
                text: "================"
            }
            dt[2] = {
                color: (this.remain <= 4) ? "#ed240e" : "#37ed0e",
                text: "Reset in: " + this.remain
            }
            if (this.remain <= 0) this.setup(data);
            this.remain--;
            break;

        }

        var lb = {
            lb: dt,
            conf: {
                lbtype: 2,
                lbtop: "HideNSeek",
                lbtsty: "#4d23ce"
            }
        }

        main.clients.forEach((client) => {
            client.socket.emit("lb", lb)
        })
        return false;

    }
    updateLB(data) {
        return false;
    }
}
