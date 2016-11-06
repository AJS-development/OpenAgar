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
        owId: (node.owner) ? node.owner.id : false,
        size: node.size,
        mass: node.mass,
        type: node.type,
        name: node.name,
        color: node.color,
        posX: node.position.x,
        posY: node.position.y,
        spiked: 0,
        skin: false,
        agit: 0
    };
    if (!a.color) console.log("k")
    // console.log(node.position.x + "|" + a.posY+"|" +main.bounds.height+ "|"+ node.position.y)
    if (node.type == 2) a.spiked = true;
    return a;
};
