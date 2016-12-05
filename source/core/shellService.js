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

const AsyncConsole = require('asyncconsole')
const EOL = require('os').EOL
module.exports = class ShellService {
    constructor(controlservice) {
        this.controller = controlservice;
        this.text = ""
        this.commands = [];
        this.redrawing = false

        this.input = new AsyncConsole(">", function (command) {
            this.parseCommands(command)
        }.bind(this), function (key) {
            if (this.redrawing || !this.controller.serverService.selected.interface) return false;
            return true;

        }.bind(this))
        this.ind = 0;
        this.console = []

        this.selected = 1;


    }
    select(id, c) {
        this.selected = id
        this.writeLog(c)
    }
    removeServ(id) {
        delete this.console[id]
    }
    clearAnim(height, width, callback) {
        process.stdout.write(" ")
        var a = false
        var text = ""
        for (var i = 0; i < width; i++) {
            text += " "
        }
        var interval = setInterval(function () {
            if (a) process.stdout.write(EOL)
            a = true;

            process.stdout.write(text)
            height--;
            if (height <= 0) {
                clearInterval(interval)
                callback()
            }
        }.bind(this), 30)
    }
    interval(num, func, call, time) {
        var int = setInterval(function () {
            func()
            num--;
            if (num <= 1) {
                clearInterval(int)
                call()
            }
        }.bind(this), time)
    }
    writeLog(cbk) { // CALLBACK HELL! (Yet too cool)
        var eol = require('os').EOL;

        var logs = this.console[this.selected]
        if (!logs) return
        var height = process.stdout.rows
        var width = process.stdout.columns

        process.stdout.write('\u001B[H\u001B[2r')
        this.redrawing = true;

        this.clearAnim(height, width - 1, function () {
            process.stdout.write("\x1b[K")

            this.interval(height, function () {
                process.stdout.write("\x1b[1A")
            }, function () {
                this.interval(width, function () {
                    process.stdout.write("\x1b[1D")
                }, function () {
                    process.stdout.write('\u001B[0r')
                    var sel = Math.max(logs.length - height, 0);
                    var self = this;

                    function set() {
                        var ind = 0;
                        var int = setInterval(function () {
                            if (logs[sel]) {
                                var d = logs[sel].charAt(ind)
                                if (!d) {
                                    process.stdout.write(eol)

                                    sel++;
                                    clearInterval(int)
                                    set()
                                }
                                process.stdout.write(d)
                                ind++;
                            } else {
                                clearInterval(int)
                                if (cbk) cbk()
                                self.redrawing = false
                            }
                        }, 3)
                    }

                    set()
                }.bind(this), 6)
            }.bind(this), 15)





            /*
         
      for (var i = 0; i < logs.length; i ++) {
            process.stdout.write(logs[i] +"\n")
      }
           */

        }.bind(this))

    }
    log(id, a, log) {
        if (id == this.selected && !log && !this.redrawing) console.log(a)
        if (!this.console[id]) this.console[id] = [];
        this.console[id].push(a.toString())
    }
    drawSplash() {
        Sounds.play('start')
        this.log(1, "\u001b[2J\u001b[0;0H");
        this.log(1, "cya{   ___                   }yel{   _                    }".styleMe())
        this.log(1, "cya{  / _ \\ _ __   ___ _ __ }yel{   / \\   __ _  __ _ _ __ }".styleMe())
        this.log(1, "cya{ | | | | '_ \\ / _ \\ '_ \\}yel{  / _ \\ / _` |/ _` | '__|}".styleMe())
        this.log(1, "cya{ | |_| | |_) |  __/ | | |}yel{/ ___ \\ (_| | (_| | |   }".styleMe())
        this.log(1, "cya{  \\___/| .__/ \\___|_| |_}yel{/_/   \\_\\__, |\\__,_|_|   }".styleMe())
        this.log(1, "cya{       |_|                }yel{      |___/            }".styleMe())
        this.log(1, "       gre{OpenAgar} - cya{An open source web game}".styleMe())
        this.log(1, "        yel{Also by the cya{AJS} Development team}".styleMe())

    }
    init() {
        this.drawSplash()

    }


    parseCommands(str) {

        //  this.controller.logger.onCommand(str);
        if (str === '') return;

        this.controller.execCommand(str)
    }
};
