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
const QuickMap = require('quickmap');
const HashBounds = require('hashbounds'); 
module.exports = class WorldModel {
    constructor(main) {
        this.nodes = new HashBounds(500,true);
     this.main = main
        this.mapnodes = new QuickMap();
        this.playerNodes = new QuickMap();
        this.virusNodes = new QuickMap();
        this.ejectedNodes = new QuickMap();
        this.movingNodes = new QuickMap();
        this.mergeNodes = new QuickMap()
        this.lastID = 2;
       this.rainbowNodes = new QuickMap()
       this.bulletNodes = new QuickMap()
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
           default:
               return this.nodes.allnodes;
               break;
               
       }
    }
    
    getNextID() {
        if (this.lastID > 1000000) {
            this.lastID = 0;
    
        }
   
        return this.lastID ++;
    }
    update(node) {
        this.nodes.update(node)
     
    }
    addNode(node, type, flags) {
        var id = this.getNextID();
        node.onAdd(id);
        this.nodes.insert(node);
   
        this.mapnodes.set(id,node);
        
        // add specified nodes
        switch (type) {
            case 0: // player
                this.playerNodes.set(id,node);
                this.main.gameMode.event('onCellAdd',{cell:node})
                break;
            case 1: // cell
                break;
            case 2: // virus
                this.virusNodes.set(id,node);
                break;
            case 3: // ejected
                this.ejectedNodes.set(id,node);
                break;
            case 4: // food
                break;
            case 5: // bullets
                this.bulletNodes.set(id,node)
                break;
        } 
        
        // set node as moving
        this.setFlags(node,flags)
    }
    setFlags(node,flags) {
        if (!flags) return;
        flags = flags.split(",");
        flags.forEach((flag)=> {
            if (!flag) return;
            switch (flag) {
                case "m": // moving
                    
                    this.movingNodes.set(node.id,node);
                    node.moving = true;
                    break;
                 case "r": // rainbow
                    this.rainbowNodes.set(node.id,node)
                    break;
                case "merge": // merge
                    this.mergeNodes.set(node.id,node)
                    break;
                default:
                    return;
                    break;
            }
           
        });
    }
    
    removeFlags(node,flags) {
        
        if (!flags) return;
        flags = flags.split(",");
        flags.forEach((flag)=> {
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
    
    removeNode(node) {
   
        this.nodes.delete(node);
  
      this.rainbowNodes.delete(node.id)
        this.mapnodes.delete(node.id);
     this.movingNodes.delete(node.id);
        
        node.moving = false
        this.ejectedNodes.delete(node.id); 
        if (this.playerNodes.delete(node.id)) {
            this.main.gameMode.event('onCellRemove',{cell:node});
            return this.mergeNodes.delete(node.id)
        }
        if (this.bulletNodes.delete(node.id)) return;
        if (this.virusNodes.delete(node.id)) return;
    }
};
