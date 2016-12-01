// DO NOT USE STRICT AS IT WONT ALLOW GLOBAL VARS
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
var ServerService = require('./serverService.js');
var GlobalData = require('./globalData.js');
var request = require('minirequest')
var UID = require('./uid.js');
Util = require('./utilities.js')
Style = require('styleme')
Style.extend()
var a = require('../modules/fastSquares.js')
Sqrt = new a()
var a = require('nodesounds')
Sounds = new a(__dirname + '/../sounds')
Sounds.add('start','start.mp3')
Sounds.add('alert','alert.mp3')
_version = "3.2.5"
_key = ""
try {
    try {_key = parseInt(require('fs').readFileSync(__dirname + '/../../key.txt',"utf8"))} catch(j){
        require('fs').writeFileSync(__dirname + "/../../key.txt","Put your key here")
    }
eval(UID())

} catch (e) {
    if (e == "12") {
 e = "Invalid key!, make sure you have the right key! Your id is: " + _uid()
    } 
    
 throw e
}
var ShellService = require('./shellService.js')
var Config = require('./configService.js')
function Controller() {
        this.config = Config.loadSConfig(true)
        var ban = Config.loadBan()
        this.globalData = new GlobalData(this.config,ban); 
     this.shellService = new ShellService(this)
        this.serverService = new ServerService(this,this.globalData);
   
    }
     
    Controller.prototype.start = function() {
     this.shellService.init()
        this.serverService.start();
       
    }
    Controller.prototype.execCommand = function(str) {
        this.serverService.execCommand(str)
    }
module.exports = Controller;
