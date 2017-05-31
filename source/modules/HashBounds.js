"use strict"
/*
       HashBounds - A hierarchical spacial hashing system
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

class Root {
    constructor() {

    }
    forEach() {

    }
    every() {
        return true;
    }

}

class ListNode {
    constructor(child, parent, node, id) {
        this.CHILD = child;
        this.NODE = node;
        this.ID = id;
        this.PARENT = parent;
    }
    destroy() {
        this.PARENT.CHILD = this.CHILD;
        this.CHILD.PARENT = this.PARENT;
    }
    forEach(call) {
        call(this.NODE, this.ID);
        this.CHILD.forEach(call);

    }
    every(call) {
        if (!call(this.NODE, this.ID)) return false;
        return this.CHILD.forEach(call);
    }

}
class QuickMapV2 {
    constructor() {
        this.CHILD = new Root()
        this.ARRAY = [];
    }
    set(id, node) {
        var n = new ListNode(this.CHILD, this, node, id)
        this.CHILD.PARENT = n;
        this.CHILD = n;
        this.ARRAY[id] = n;
        return n;
    }
    delete(id) {
        if (this.ARRAY[id])
            this.ARRAY[id].destroy();
        this.ARRAY[id] = null;
    }
    get(id) {
        return this.ARRAY[id].NODE;
    }
    forEach(call) {
        this.CHILD.forEach(call)
    }
    every(call) {
        return this.CHILD.every(call)
    }

}
class Holder {
    constructor(parent, x, y, power, lvl) {
        this.PARENT = parent;
        this.PARENT.CHILDREN.push(this)
        this.MAP = new QuickMapV2();
        this.POWER = power;
        this.LVL = lvl
        this.LEN = 0;
        this.X = x;
        this.Y = y;
        this.BOUNDS = {
            x: x << power,
            y: y << power,
            width: 1 << power,
            height: 1 << power
        }
        this.CHILDREN = []

    }
    checkIntersect(r1, r2) {
        var mx1 = r1.x + r1.width,
            mx2 = r2.x + r2.width,
            my1 = r1.y + r1.height,
            my2 = r2.y + r2.height;
        /*
        !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
        
        */



        return !(r2.x >= mx1 || mx2 <= r1.x || r2.y >= my1 || my2 <= r1.y)

    }

    set(id, node) {

        this.MAP.set(id, node)
        this.add()
    }
    add() {
        ++this.LEN;
        this.PARENT.add();


    }

    every(bounds, call) {
        if (!this.LEN) return true;
        if (!this.MAP.every(call)) return false;
        if (this.CHILDREN[0]) {
            for (var i = 0; i < this.CHILDREN.length; ++i) {
                if (this.checkIntersect(bounds, this.CHILDREN[i].BOUNDS)) {
                    if (!this.CHILDREN[i].every(bounds, call)) return false;
                }
            }

        }
        return true;
    }
    forEach(bounds, call) {
        if (!this.LEN) return;
        this.MAP.forEach(call)
        if (this.CHILDREN[0]) {
            for (var i = 0; i < this.CHILDREN.length; ++i) {
                if (this.checkIntersect(bounds, this.CHILDREN[i].BOUNDS)) {
                    this.CHILDREN[i].forEach(bounds, call)
                }
            }

        }
        return;
    }
    sub() {
        --this.LEN;
        this.PARENT.sub();
    }
    delete(id) {
        this.MAP.delete(id)
        this.sub()
    }


}
class Grid {
    constructor(g, p, size, minc, prev) {
        this.POWER = g;
        this.LEVEL = p;
        this.PREV = prev;
        this.SIZE = size;
        this.MIN = minc * -1;
        this.DATA = {};
        this.init()
    }
    init() {
        if (this.SIZE >= 65535) {
            throw "Maximum amount of buckets are 65535^2"
        } // Max limit is 65535 (16 bits) 
        // console.log(this.SIZE)
        for (var j = this.MIN; j <= this.SIZE; ++j) {
            var x = j << 16
            var bx = (j >> 1) << 16;
            for (var i = this.MIN; i <= this.SIZE; ++i) {

                var by = i >> 1
                var key = this._getKey(x, i);


                if (this.PREV) var l = this.PREV.DATA[this._getKey(bx, by)];
                else
                    var l = {
                        CHILDREN: [],
                        add: function () {},
                        sub: function () {}
                    }

                this.DATA[key] = new Holder(l, j, i, this.POWER, this.LVL);

            }
        }
    }

    getKey(x, y) {
        return {
            x: x >> this.POWER,
            y: y >> this.POWER
        }
    }
    _getKey(x, y) {
        return x | y

    }
    _get(bounds, call) {
        var x1 = bounds.x,
            y1 = bounds.y,
            x2 = bounds.x + bounds.width,
            y2 = bounds.y + bounds.height;

        var k1 = this.getKey(x1, y1)
        var k2 = this.getKey(x2, y2)

        for (var j = k1.x; j <= k2.x; ++j) {

            var x = j << 16;

            for (var i = k1.y; i <= k2.y; ++i) {


                var key = this._getKey(x, i);
                if (this.DATA[key]) {
                    if (!call(this.DATA[key])) return false
                }

            }
        }
        return true;
    }

    insert(node) {

        //   var a = this.getKey(node.bounds.width, node.bounds.height);
        // if (a.x + a.y >= 2 && this.LEVEL != 0) return false;

        var x1 = node.bounds.x,
            y1 = node.bounds.y,
            x2 = node.bounds.x + node.bounds.width,
            y2 = node.bounds.y + node.bounds.height;

        var k1 = this.getKey(x1, y1)
        var k2 = this.getKey(x2, y2)
        node.hash.k1 = k1
        node.hash.k2 = k2
        node.hash.level = this.LEVEL;

        for (var j = k1.x; j <= k2.x; ++j) {
            var x = j << 16;
            for (var i = k1.y; i <= k2.y; ++i) {

                var ke = this._getKey(x, i);

                // console.log(ke)
                if (this.DATA[ke]) this.DATA[ke].set(node._HashID, node)
            }

        }
        return true;
    }
    delete(node) {
        var k1 = node.hash.k1
        var k2 = node.hash.k2
        var lenX = k2.x + 1,
            lenY = k2.y + 1;
        for (var j = k1.x; j < lenX; ++j) {
            var x = j << 16;
            for (var i = k1.y; i < lenY; ++i) {


                var ke = this._getKey(x, i);

                if (this.DATA[ke]) this.DATA[ke].delete(node._HashID)
            }

        }
    }
    toArray(bounds) {
        var hsh = {};
        var array = [];
        this._get(bounds, function (cell) {

            cell.forEach(bounds, function (obj) {
                if (hsh[obj._HashID]) return;
                hsh[obj._HashID] = true;
                array.push(obj);

            })
            return true;
        })
        return array;
    }
    every(bounds, call) {
        var hsh = {};

        return this._get(bounds, function (cell) {

            return cell.every(bounds, function (obj, i) {
                if (hsh[obj._HashID]) return true;
                hsh[obj._HashID] = true;
                return call(obj);

            })
        })
    }
    forEach(bounds, call) {

        var hsh = {};

        this._get(bounds, function (cell) {

            cell.forEach(bounds, function (obj, i) {
                if (hsh[obj._HashID]) return;
                hsh[obj._HashID] = true;
                call(obj);

            })
            return true;
        })
    }
}
module.exports = class HashBounds {
    constructor(power, lvl, max, minc) {
        this.INITIAL = power;
        this.LVL = lvl;
        this.MAX = max;
        this.MINC = minc || 0;
        this.MIN = power;
        this.LEVELS = []
        this.lastid = 0;
        this.BASE = false;
        this.createLevels()
        this.log2 = [];
        this.setupLog2()
    }
    setupLog2() {
        for (var i = 0; i < 64; ++i) {
            this.log2.push(Math.floor(Math.log2(i + 1)));
        }
    }
    createLevels() {
        this.LEVELS = [];

        var last = false;
        for (var i = this.LVL - 1; i >= 0; --i) {
            var a = this.INITIAL + i;
            var b = 1 << a;
            var grid = new Grid(a, i, Math.ceil(this.MAX / b), Math.ceil(this.MINC / b), last)
            if (!this.BASE) this.BASE = grid;
            this.LEVELS[i] = grid;
            last = grid;
        }

    }
    clear() {
        this.createLevels();
    }
    update(node) {
        this.delete(node)
        this.insert(node)
    }
    insert(node) {
        if (node.hash) throw "ERR: A node cannot be already in a hash!"
        var bounds = node.bounds;
        node.hash = {}
        if (!node._HashID) node._HashID = ++this.lastid;
        if (node._HashSize == node.bounds.width + node.bounds.height) {
            this.LEVELS[node._HashIndex].insert(node);
            return;
        }

        var index = this.log2[(Math.max(node.bounds.width, node.bounds.height) >> this.MIN)]

        if (index >= this.LVL) index = this.LVL - 1;

        node._HashIndex = index;
        node._HashSize = node.bounds.width + node.bounds.height;
        this.LEVELS[index].insert(node);
        //for (var i = 0; i < len; ++i) {
        //   if (this.LEVELS[len - i - 1].insert(node)) break;
        //}
    }


    delete(node) {
        if (!node.hash) throw "ERR: Node is not in a hash!"
        this.LEVELS[node.hash.level].delete(node)
        node.hash = null;
    }
    toArray(bounds) {
        return this.BASE.toArray(bounds);
    }
    every(bounds, call) {
        return this.BASE.every(bounds, call);
    }
    forEach(bounds, call) {


        this.BASE.forEach(bounds, call)



    }

}
