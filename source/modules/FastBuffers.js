"use strict";
/*
Copyright 2016 Andrew S

You may use this without this copyright header, this header is only so people cant sue me if they claim it as theirs. 
*/
module.exports = {
    writer: class Writer {
        constructor(size) {
            this.index = 0;
            this.buffer = Buffer.alloc(size);
        }
        writeString8(string) {

            for (var i = 0; i < string.length; i++) {
                var c = string.charCodeAt(i);
                this.writeUInt8(c);
            }
            this.writeUInt8(0)
        }
        writeString16(string) {

            for (var i = 0; i < string.length; i++) {
                var c = string.charCodeAt(i);

                this.writeUInt16BE(c);
            }

            this.writeUInt16BE(0);

        }
        writeString32(string) {

            for (var i = 0; i < string.length; i++) {
                var c = string.charCodeAt(i)
                if (c) this.writeUInt32BE(c)
            }
            this.writeUInt32BE(0);
        }
        writeDynamic(a) {
            var i;
            if (a > 270549119) {
                throw "ERR: OUT OF BOUNDS"
            } else if (a > 2113663) {
                a = a - 2113664;
                i = 3;
            } else if (a > 16511) {
                a = a - 16512;
                i = 2;
            } else if (a > 127) {
                a = a - 128;
                i = 1;
            } else {
                i = 0;
            }

            for (var j = 0; j < i; j++) {

                this.writeUInt8((a & 127) | 128);
                a = a >> 7;
            }
            this.writeUInt8(a);
        }

        writeInt8(n) {
            this.buffer.writeInt8(n, this.index++)
        }
        writeInt16BE(n) {
            this.buffer.writeInt16BE(n, this.index)
            this.index += 2;
        }
        writeInt16LE(n) {
            this.buffer.writeInt16LE(n, this.index)
            this.index += 2;
        }
        writeInt32BE(n) {
            this.buffer.writeInt32BE(n, this.index)
            this.index += 4;
        }
        writeInt32LE(n) {
            this.buffer.writeInt32LE(n, this.index)
            this.index += 4;
        }
        writeUInt8(n) {
            this.buffer.writeUInt8(n, this.index++)
        }
        writeUInt16BE(n) {
            this.buffer.writeUInt16BE(n, this.index)
            this.index += 2;
        }
        writeUInt16LE(n) {
            this.buffer.writeUInt16LE(n, this.index)
            this.index += 2;
        }
        writeUInt32BE(n) {
            this.buffer.writeUInt32BE(n, this.index)
            this.index += 4;
        }
        writeUInt32LE(n) {
            this.buffer.writeUInt32LE(n, this.index)
            this.index += 4;
        }
        toBuffer() {
            return this.buffer;
        }
    },
    getDynamicSize: function (a) {
        if (a > 270549119) {
            throw "ERR: OUT OF BOUNDS"
        } else if (a > 2113663) {
            return 4;
        } else if (a > 16511) {
            return 3;
        } else if (a > 127) {
            return 2;
        } else {
            return 1;
        }
    },
    reader: class Reader {
        constructor(buf) {
            this.index = 0;
            this.buffer = buf;
        }
        readString8() {
            var data = "";
            while (this.index <= this.buffer.length) {
                var d = this.readUInt8();
                if (!d) break;
                data += String.fromCharCode(d);
            }
            return data;
        }
        readString16() {
            var data = "";
            while (this.index <= this.buffer.length) {
                var d = this.readUInt16BE();
                if (!d) break;
                data += String.fromCharCode(d);
            }
            return data;
        }
        readString32() {
            var data = "";
            while (this.index <= this.buffer.length) {
                var d = this.readUInt32BE();
                if (!d) break;
                data += String.fromCharCode(d);
            }
            return data;
        }
        readDynamic() {
            var num = 0;

            for (var i = 0; i < 4; i++) {

                var n = this.readUInt8();

                num += (n & 127) << (i * 7);


                if (n < 127) {
                    break;
                }
            }

            if (i === 2) num += 128;
            else if (i === 3) num += 16512;
            else if (i === 4) num += 2113664;

            return num;
        }
        readInt8() {
            return this.buffer.readInt8(this.index++);
        }
        readUInt8() {
            return this.buffer.readUInt8(this.index++);
        }
        readInt16BE() {
            var data = this.buffer.readInt16BE(this.index);
            this.index += 2;
            return data;
        }
        readInt16LE() {
            var data = this.buffer.readInt16LE(this.index);
            this.index += 2;
            return data;
        }
        readUInt16BE() {
            var data = this.buffer.readUInt16BE(this.index);
            this.index += 2;
            return data;
        }
        readUInt16LE() {
            var data = this.buffer.readUInt16LE(this.index);
            this.index += 2;
            return data;
        }
        readInt32BE() {
            var data = this.buffer.readInt32BE(this.index);
            this.index += 4;
            return data;
        }
        readInt32LE() {
            var data = this.buffer.readInt32LE(this.index);
            this.index += 4;
            return data;
        }
        readUInt32BE() {
            var data = this.buffer.readUInt32BE(this.index);
            this.index += 4;
            return data;
        }
        readUInt32LE() {
            var data = this.buffer.readUInt32LE(this.index);
            this.index += 4;
            return data;
        }

    }

}
