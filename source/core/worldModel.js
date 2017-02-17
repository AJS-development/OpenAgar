"use strict";
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

const HashBounds = require('hashbounds');
module.exports = class WorldModel {
    constructor(main) {
        this.nodes = new HashBounds(7, 3,Math.max(main.bounds.width,main.bounds.height) + 700,700);
        this.main = main
        this.mapnodes = new Map();
        this.playerNodes = new Map();
        this.virusNodes = new Map();
        this.ejectedNodes = new Map();
        this.movingNodes = new Map();
        this.mergeNodes = new Map();
        this.lastID = 2;
        this.rainbowNodes = new Map();
        this.bulletNodes = new Map();
        this.wormHoleNodes = new Map();
        this.entities = {};
        this.entMap = [];
    }

    getNodes(s) {
        switch (s) {
        case "all":
            return this.nodes.allnodes;
            break;
        case "map":
            return this.mapnodes;
            break;
        case "hash":
            return this.nodes;
            break;
        case "moving":
            return this.movingNodes;
            break;
        case "player":
            return this.playerNodes;
            break;
        case "virus":
            return this.virusNodes;
        case "ejected":
            return this.ejectedNodes;
        case "merge":
            return this.mergeNodes;
            break;
        case "bullet":
            return this.bulletNodes;
            break;
        case "wormhole":
            return this.wormHoleNodes;
            break;
        default:
            if (!s) return this.nodes.allnodes;
            if (!this.entities[s]) return false;
            return this.entities[s];
            break;

        }
    }

    getNextID() {
        if (this.lastID > 1000000) {
            this.lastID = 0;

        }

        return this.lastID++;
    }
    update(node) {
        this.nodes.update(node)

    }
    addEntity(id, name) {
        this.entMap[id] = name;
        this.entities[name] = new Map();
    }
    addNode(node, type, flags) {

        var id = this.getNextID();
        node.bounds = {
            x: node.position.x - node.size,
            y: node.position.y - node.size,
            width: node.size * 2,
            height: node.size * 2
        }
        node.onAdd(id);

        this.nodes.insert(node);

        this.mapnodes.set(id, node);
        this.main.gameMode.event('onAllAdd', {
                cell: node
            })
            // add specified nodes
        switch (type) {
        case 0: // player
            this.playerNodes.set(id, node);
            this.main.gameMode.event('onCellAdd', {
                cell: node
            })
            break;
        case 1: // cell
            break;
        case 2: // virus
            this.virusNodes.set(id, node);
            break;
        case 3: // ejected
            this.ejectedNodes.set(id, node);
            break;
        case 4: // food
            break;
        case 5: // bullets
            this.bulletNodes.set(id, node)
            break;
        case 6: // wormhole
            this.wormHoleNodes.set(id, node)
            break;
        default:
            if (!this.entMap[type]) return false;
            this.entities[this.entMap[type]].set(id, node)
            break;
        }

        // set node as moving
        this.setFlags(node, flags)
    }
    setFlags(node, flags) {
        if (!flags) return;
        flags = flags.split(",");
        flags.forEach((flag) => {
            if (!flag) return;
            switch (flag) {
            case "m": // moving

                this.movingNodes.set(node.id, node);
                node.moving = true;
                break;
            case "r": // rainbow
                this.rainbowNodes.set(node.id, node)
                break;
            case "merge": // merge
                this.mergeNodes.set(node.id, node)
                break;
            default:
                return;
                break;
            }

        });
    }

    removeFlags(node, flags) {

        if (!flags) return;
        flags = flags.split(",");
        flags.forEach((flag) => {
            if (!flag) return;
            switch (flag) {
            case "m": // moving
                this.movingNodes.delete(node.id);
                if (node.type != 0) node.moving = false;
                this.main.childService.sendMove(node)
                break;
            case "r": // rainbow
                this.rainbowNodes.delete(node.id)
                break;
            case "merge":
                this.mergeNodes.delete(node.id)
                break;
            default:
                return;
                break;
            }

        });
    }
    deleteFromEnt(node) {
        for (var i in this.entities) {
            this.entities[i].delete(node.id)
        }
    }
    clear() {
        this.nodes.clear();
        this.mapnodes.clear();
        this.playerNodes.clear();
        this.virusNodes.clear();
        this.ejectedNodes.clear();
        this.movingNodes.clear();
        this.mergeNodes.clear();
        this.lastID = 2;
        this.rainbowNodes.clear();
        this.bulletNodes.clear();
        this.wormHoleNodes.clear();
        for (var i in this.entities) {
            this.entities[i].clear();
        }
    }
    removeNode(node) {

        if (node.hash) this.nodes.delete(node);
        this.main.gameMode.event('onAllRemove', {
            cell: node
        });
        this.rainbowNodes.delete(node.id)
        this.mapnodes.delete(node.id);
        this.movingNodes.delete(node.id);
        this.deleteFromEnt(node)
        node.moving = false
        this.ejectedNodes.delete(node.id);
        if (this.playerNodes.delete(node.id)) {
            this.main.gameMode.event('onCellRemove', {
                cell: node
            });
            return this.mergeNodes.delete(node.id)
        }

        if (this.bulletNodes.delete(node.id)) return;
        if (this.wormHoleNodes.delete(node.id)) return;
        if (this.virusNodes.delete(node.id)) return;
    }
};
