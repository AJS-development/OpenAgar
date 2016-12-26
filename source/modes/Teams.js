"use strict"
var template = require('./template.js');
module.exports = class FFA extends template {
    constructor() {
        super()
        this.id = 1;
        this.name = "TEAMS";
        this.lt = 0;
    }

    onServerInit(data) {
        var main = data.main
        main.haveTeams = true;

    }
    onAllInit(data) {
        data.player.team = (this.lt++) % 3;
    }
    onCellAdd(data) {
        data.cell.doesCollide = function (cell) {
            if (this.owner.team == cell.owner.team) return true;
            return false;
        }
    }
    updateLB(data) {
        var main = data.main;
        var data = [];
        data[0] = 0;
        data[1] = 0;
        data[2] = 0;
        var total = 0;
        main.loopPlayers((player) => {
            data[player.team] += player.mass;
            total += player.mass;
        })

        data[0] = data[0] / total;
        data[1] = data[1] / total;
        data[2] = data[2] / total;
        var lb = {
            lb: data,
            conf: {
                lbtype: 1
            }

        }
        main.clients.forEach((client) => {

            client.socket.emit('lb', lb);
        })
        return false;
    }
}