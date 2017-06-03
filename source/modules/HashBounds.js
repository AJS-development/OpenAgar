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


class Holder {
    constructor(parent, x, y, power, lvl) {
        this.PARENT = parent;
        this.PARENT.CHILDREN.push(this)
            // this.MAP = new QuickMapV2();
        this.MAP = [];
        this.POWER = power;
        this.LVL = lvl
        this.LEN = 0; // problem with lots of objs
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

    set(node) {

        this.MAP.push(node);
        this.add()
    }
    delete(node) {
        var ind = this.MAP.indexOf(node)

        this.MAP[ind] = this.MAP[this.MAP.length - 1];
        this.MAP.pop();
        this.sub()
    }
    add() {
        ++this.LEN;
        this.PARENT.add();


    }

    getQuad(bounds, bounds2) {
        if (!this.CHILDREN[0]) return -2;

        var minX = bounds.x,
            minY = bounds.y,
            maxX = bounds.x + bounds.width,
            maxY = bounds.y + bounds.height,
            minX2 = bounds2.x,
            minY2 = bounds2.y,
            maxX2 = bounds2.x + bounds2.width,
            maxY2 = bounds2.y + bounds2.height,
            halfY = bounds2.y + (bounds2.height >> 1),
            halfX = bounds2.x + (bounds2.width >> 1);


        var top = maxY <= halfY;
        var bottom = minY > halfY;
        var left = maxX <= halfX;
        var right = minX > halfX;


        if (top) {
            if (left) return [0];
            else if (right) return [2];
            return [0, 2];
        } else if (bottom) {
            if (left) return [1];
            else if (right) return [3];
            return [1, 3];
        }

        if (left) {
            return [0, 1];
        } else if (right) {
            return [2, 3];
        }

        if (bounds.width < bounds2.width || bounds.height < bounds2.height) return [0, 1, 2, 3];
        return -1; // too big
    }



    forEachAll(call) {
        if (!this.LEN) return;
        this.MAP.forEach(call)

        for (var i = 0; i < this.CHILDREN.length; ++i) {
            this.CHILDREN[i].forEachAll(call)
        }


    }
    forEach(bounds, call) {
        if (!this.LEN) return;


        var quads = this.getQuad(bounds, this.BOUNDS)

        if (quads === -1) return this.forEachAll(call);

        this.MAP.forEach(call)

        if (quads === -2) return

        for (var i = 0, l = quads.length; i < l; i++) {
            var child = this.CHILDREN[quads[i]];
            if (child) child.forEach(bounds, call)
        }


        return;
    }
    every(bounds, call) {
        if (!this.LEN) return true;

        var quads = this.getQuad(bounds, this.BOUNDS)

        if (quads === -1) return this.everyAll(call);

        if (!this.MAP.every(call)) return false;

        if (quads === -2) return true;

        return quads.every((q) => {
            var child = this.CHILDREN[q];
            if (!child) return true;
            return child.every(bounds, call)
        })
    }
    everyAll(call) {
        if (!this.LEN) return true;
        if (!this.MAP.every(call)) return false;
        for (var i = 0; i < this.CHILDREN.length; ++i) {
            if (!this.CHILDREN[i].everyAll(call)) return false;
        }
        return true;
    }

    sub() {
        --this.LEN;
        this.PARENT.sub();
    }


}
class Grid {
    constructor(g, p, size, prev) {
        this.POWER = g;
        this.LEVEL = p;
        this.PREV = prev;
        this.SIZE = size;

        this.DATA = {};
        this.init()
    }

    init() {
        if (this.SIZE >= 65535) {
            throw "Maximum amount of buckets are 65535^2"
        } // Max limit is 65535 (16 bits) 
        // console.log(this.SIZE)
        for (var j = 0; j < this.SIZE; ++j) {
            var x = j * this.SIZE;
            if (this.PREV) var bx = (j >> 1) * this.PREV.SIZE;
            for (var i = 0; i < this.SIZE; ++i) {

                var by = i >> 1;
                var key = x + i;


                if (this.PREV) var l = this.PREV.DATA[bx + by];
                else
                    var l = {
                        CHILDREN: [],
                        add: function () {},
                        sub: function () {}
                    }
                this.DATA[key] = new Holder(l, j, i, this.POWER, this.LEVEL);

            }
        }
    }

    getKey(x, y) {
        return {
            x: Math.max(x >> this.POWER, 0),
            y: Math.max(y >> this.POWER, 0)
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

            var x = j * this.SIZE;

            for (var i = k1.y; i <= k2.y; ++i) {


                var key = x + i;
                if (this.DATA[key]) {
                    if (!call(this.DATA[key])) return false
                }

            }
        }
        return true;
    }

    insert2(node) {

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
            var x = j * this.SIZE;
            for (var i = k1.y; i <= k2.y; ++i) {

                var ke = x + i;

                // console.log(ke)
                this.DATA[ke].set(node)



            }

        }


        return true;
    }
    delete(node) {
        var k1 = node.hash.k1
        var k2 = node.hash.k2
        var lenX = k2.x,
            lenY = k2.y;
        for (var j = k1.x; j <= lenX; ++j) {
            var x = j * this.SIZE;
            for (var i = k1.y; i <= lenY; ++i) {


                var ke = x + i;

                this.DATA[ke].delete(node)
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
    constructor(power, lvl, max) {
        this.INITIAL = power;
        this.LVL = lvl;
        this.MAX = max;

        this.MIN = power;
        this.LEVELS = []
        this.lastid = 0;
        this.BASE = false;
        this.createLevels()
        this.log2 = [];
        this.setupLog2()
    }
    setupLog2() {
        var pow = 1 << this.LVL;

        for (var i = 0; i < pow; ++i) {
            this.log2.push(Math.floor(Math.log2(i + 1)))
        }
    }
    createLevels() {
        this.LEVELS = [];

        var last = false;
        for (var i = this.LVL - 1; i >= 0; --i) {
            var a = this.INITIAL + i;
            var b = 1 << a;
            var grid = new Grid(a, i, Math.ceil(this.MAX / b), last)
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
        if (node._IsInHash) throw "ERR: A node cannot be already in a hash!"
        var bounds = node.bounds;
        node._IsInHash = true;

        if (node._HashSizeX === bounds.width && node._HashSizeY === bounds.height) {
            this.LEVELS[node._HashIndex].insert2(node);
            return;
        }

        if (!node._HashID) {
            node._HashID = ++this.lastid;
            node.hash = {};
        }

        var index = this.log2[(Math.max(bounds.width, bounds.height) >> this.MIN)]
        if (index === undefined) index = this.LVL - 1;

        node._HashIndex = index;
        node._HashSizeX = bounds.width;
        node._HashSizeY = bounds.height;

        this.LEVELS[index].insert2(node);

        //for (var i = 0; i < len; ++i) {
        //   if (this.LEVELS[len - i - 1].insert(node)) break;
        //}
    }


    delete(node) {
        if (!node._IsInHash) throw "ERR: Node is not in a hash!"
        this.LEVELS[node.hash.level].delete(node)
        node._IsInHash = false;
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