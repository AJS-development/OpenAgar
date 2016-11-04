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
module.exports = class ShellService {
    constructor(controlservice) {
        this.controller = controlservice;
        this.text = ""
        this.stdin = process.stdin;
this.stdin.setRawMode(true);
this.stdin.resume();
this.stdin.setEncoding('utf8');
        this.stdin.on('data', function(key){
            if (key == '\u0003') { process.exit(); }    // ctrl-c
   this.prompt(key)
   


    
}.bind(this));

    }
    drawSplash() {
console.log("   ___                      _                    ")
console.log("  / _ \\ _ __   ___ _ __    / \\   __ _  __ _ _ __ ")
console.log(" | | | | '_ \\ / _ \\ '_ \\  / _ \\ / _` |/ _` | '__|")
console.log(" | |_| | |_) |  __/ | | |/ ___ \\ (_| | (_| | |   ")
console.log("  \\___/| .__/ \\___|_| |_/_/   \\_\\__, |\\__,_|_|   ")
console.log("       |_|                      |___/            ")
    }
    init() {
        this.drawSplash()
       process.stdout.write('\n>')
    }
    escapeChar(a) {
 var allowed = "` 1 2 3 4 5 6 7 8 9 0 - = q w e r t y u i o p [ ] | a s d f g h j k l ; ' z x c v b n m , . / ~ ! @ # $ % ^ & * ( ) _ + Q W E R T Y U I O P { } A S D F G H J K L : \\ \" Z X C V B N M < > ?"
 var allow = allowed.split(" ");
 if (a == " ") return true;
 if (allow.indexOf(a) == -1) return false;
 return true;
}
    prompt(key) {
        if (key == '\u000D') { //enter
             process.stdout.write('\n')
        if (this.text) this.parseCommands(this.text.toLowerCase())
        this.text = ""
        process.stdout.write('>')
            return;
        }
        if (key == '\u007F' && this.text.length > 0) {
            this.text = this.text.substr(0,this.text.length - 1)
            process.stdout.write('\r>' + this.text);
            return
        }
       if (!this.escapeChar(key)) return
       
       this.text += key
       
       process.stdout.write(key.toString())
    }

    parseCommands(str) {
      //  this.controller.logger.onCommand(str);
        if (str === '') return;
        this.controller.execCommand(str)
    }
};
