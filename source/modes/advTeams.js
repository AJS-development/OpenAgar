"use strict"
var template = require('./template.js');
module.exports = class Teams extends template {
    constructor() {
        super()
        this.id = 1;
        this.name = "Advanced Teams";
        this.lowest = 0;
        this.highest = false;
        this.colors = [{
            'r': 223,
            'g': 0,
            'b': 0
  }, {
            'r': 0,
            'g': 223,
            'b': 0
  }, {
            'r': 0,
            'g': 0,
            'b': 223
  }, ];
    }

    onServerInit(data) {
        var main = data.main
        main.haveTeams = true;

    }
    onAllInit(data) {
        data.player.team = this.lowest;

        data.player.gameData.color = this.colors[data.player.team]

    }
    onCellAdd(data) {
        data.cell.doesCollide = function (cell) {

            if (cell.type == 0 && this.owner.team == cell.owner.team) return true;
            return false;
        }
        data.cell.canEat = function(cell,main) {
            if (cell.type != 0 || this.owner.team == cell.owner.team) return true;
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
        var g = 0,
            h = 0,
            l = data[0],
            j = 0;

        data.forEach((n, i) => {

            if (n > h) {
                h = n;
                g = i;
            }
            if (n < l) {
                l = n;
                j = i;
            }
        })

        this.lowest = j;
        this.highest = g;

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
