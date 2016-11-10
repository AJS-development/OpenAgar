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
_version = "2.8.1"
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
function Controller() {
        this.config = {
            serverPort: 8080,
            socketProtection: true
        };
        
        this.globalData = new GlobalData(this.config); 
        this.serverService = new ServerService(this,this.globalData);
    this.shellService = new ShellService(this)
    }
     
    Controller.prototype.start = function() {
    
        this.serverService.start();
        this.shellService.init()
    }
    Controller.prototype.execCommand = function(str) {
        this.serverService.execCommand(str)
    }
module.exports = Controller;
