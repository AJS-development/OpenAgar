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
module.exports = function(node, main) {
    
    var a = {
        id: node.id,
        owId: (node.owner) ? node.owner.id : 0,
        size: node.size,
        mass: node.mass,
        type: node.type,
        posX: node.position.x,
        posY: node.position.y,
        color: node.color
    };
    node.name && (a.name = node.name)
    node.agit && (a.agit = 1)
    node.skin && (a.skin = node.skin)
  
    node.spiked && (a.spiked = 1);
    return a;
};
