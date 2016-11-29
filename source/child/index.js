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
var Manager = require('./manager.js')
var manager = new Manager()
var QuickMap = require('quickmap')
var managers = new QuickMap();
// require('../../cpu.js').init('./data')
process.on('message',function(msg) {
    if (msg.sid || msg.sid == 0) {
   var manager = managers.get(msg.sid)
 if (!manager) return;
    }

    switch (msg.type) {
        case 0: // init
            
            manager.init(msg)
            break;
        case 1: // addnodes
             manager.addNodes(msg.nodes)
            break;
        case 2: // deletenodes
            manager.removeNodes(msg.nodes)
            break;
        case 3: // movecode
            manager.moveCode(msg.nodes)
            break;
        case 4: // assign
            manager.assign(msg.nodes)
            break;
        case 5:
            manager.addBot(msg.id,msg.bot)
            break;
        case 6: // stop
            managers.forEach(function(m) {
                m.onRemove()
            })
            process.exit(0)
            break;
        case 7: // event
            manager.event(msg)
            break;
        case 8: // assign/deassign
            if (msg.a || msg.a === 0) {
                var mn = new Manager(msg.a)
            
             managers.set(msg.a,mn)
            } else if (msg.da || msg.a === 0) {
                var mn = manager.get(msg.da)
                if (mn) mn.onRemove()
                manager.delete(msg.da)
            }
            
            
            break;
        case 9: // pause;
            
            manager.pause(msg)
            break;
            
    }
    
    
})
