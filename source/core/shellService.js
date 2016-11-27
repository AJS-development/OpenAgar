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
        this.commands = [];
        this.redrawing = false
        this.stdin = process.stdin;
        this.ind = 0;
        this.console = []
this.stdin.setRawMode(true);
        this.selected = 0;
this.stdin.resume();
this.stdin.setEncoding('utf8');
        this.stdin.on('data', function(key){
            if (key == '\u0003') { process.exit(); }    // ctrl-c
   this.prompt(key)
   

  
}.bind(this));

    }
    select(id,c) {
        this.selected = id
        this.writeLog(c)
    }
    removeServ(id) {
        delete this.console[id]
    }
    clearAnim(amount,callback) {
           process.stdout.write(" ")
           var interval = setInterval(function() {
                process.stdout.write(" ")
                amount --;
               if (amount <= 1) {
                   clearInterval(interval)
                callback()   
               }
           }.bind(this),1)
    }
    interval(num,func,call,time) {
        var int = setInterval(function() {
            func()
            num --;
            if (num <= 1) {
                clearInterval(int)
                call()   
            }
        }.bind(this),time)
    }
    writeLog(cbk) { // CALLBACK HELL! (Yet too cool)
        var eol = require('os').EOL;
        
                var logs = this.console[this.selected]
                if (!logs) return
       var height = process.stdout.rows
       var width = process.stdout.columns
       
        process.stdout.write('\u001B[H\u001B[2r')
      this.redrawing = true;
     
      this.clearAnim(height * width,function() {
          process.stdout.write("\x1b[K")
          
               this.interval(height,function() {process.stdout.write("\x1b[1A")},function() {
                  this.interval(width, function() {process.stdout.write("\x1b[1D")},function() {
                        process.stdout.write('\u001B[0r')
                      var sel = Math.max(logs.length - height,0);
                      var self = this;
                      function set() {
                        var ind = 0;  
                      var int = setInterval(function() {
                          if (logs[sel]) {
                              var d = logs[sel].charAt(ind)
                              if (!d) {
                                  process.stdout.write(eol)
                                  
                                  sel ++;
                                  clearInterval(int)
                                  set()
                              }
                              process.stdout.write(d)
                              ind ++;
                          } else {
                              clearInterval(int)
                             if (cbk) cbk()
                             self.redrawing = false
                          }
                      },5)
                      }
                    
                      set()
                  }.bind(this),15)
               }.bind(this),20)
           
      
   
  
      
        /*
         
      for (var i = 0; i < logs.length; i ++) {
            process.stdout.write(logs[i] +"\n")
      }
           */
          
      }.bind(this))
         
    }
     log(id,a,log) {
         if (id == this.selected && !log) console.log(a)
        if (!this.console[id]) this.console[id] = [];
        this.console[id].push(a.toString())
    }
    drawSplash() {

this.log(1,"   ___                      _                    ")
this.log(1,"  / _ \\ _ __   ___ _ __    / \\   __ _  __ _ _ __ ")
this.log(1," | | | | '_ \\ / _ \\ '_ \\  / _ \\ / _` |/ _` | '__|")
this.log(1," | |_| | |_) |  __/ | | |/ ___ \\ (_| | (_| | |   ")
this.log(1,"  \\___/| .__/ \\___|_| |_/_/   \\_\\__, |\\__,_|_|   ")
this.log(1,"       |_|                      |___/            ")
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
 
         if (this.redrawing || !this.controller.serverService.selected.interface) return;
        if (key == '\u000D') { //enter
             process.stdout.write('\n')
        if (this.text) {this.parseCommands(this.text)
        this.commands.push(this.text)
                       }
       
        this.text = ""
        this.ind = this.commands.length
        if (!this.redrawing) process.stdout.write('>')
        
            return;
        } else if (key == '\u001B\u005B\u0041') { // up
      
            if (this.ind > 0) this.ind --;
                this.text = this.commands[this.ind] || ""
                process.stdout.write('\r                                   ');
                    process.stdout.write('\r>' + this.text);
            return
       
               } else if (key == '\u001B\u005B\u0042') { // down
              
                   if (this.ind < this.commands.length) this.ind ++;
                   this.text = this.commands[this.ind] || ""
                   process.stdout.write('\r                                   ');
                    process.stdout.write('\r>' + this.text);
                   return;
                   
        } else if (key == '\u007F' && this.text.length > 0) {
            this.ind = this.commands.length
            this.text = this.text.substr(0,this.text.length - 1)
            process.stdout.write('\r                                   ');
            process.stdout.write('\r>' + this.text);
            return
        } else {
       if (!this.escapeChar(key)) return
       this.ind = this.commands.length
       this.text += key
       
       process.stdout.write(key.toString())
        }
    }

    parseCommands(str) {
        
      //  this.controller.logger.onCommand(str);
        if (str === '') return;
        this.log(this.selected,">" + str,true)
        this.controller.execCommand(str)
    }
};
