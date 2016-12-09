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

Util = require('./utilities.js')
Style = require('styleme')
Style.extend()
var a = require('../modules/fastSquares.js')
Sqrt = new a()

var a = require('nodesounds')
Sounds = new a(__dirname + '/../sounds')
Sounds.add('start', 'start.mp3')
Sounds.add('alert', 'alert.mp3')
Sounds.add('tone', 'tone.mp3')

_version = "3.6.0"
_key = ""
try {
    try {
        _key = parseInt(require('fs').readFileSync(__dirname + '/../../key.txt', "utf8"))
    } catch (j) {
        require('fs').writeFileSync(__dirname + "/../../key.txt", "Put your key here")
    }
    var UID = require('./uid.js');

} catch (e) {
    if (e == "12") {
        Sounds.play('alert')
        console.log("red{[OpenAgar]}Invalid key!, make sure you have the right key! Your id is: ".styleMe() + _uid())
        process.exit(0)
        return;
    }

    throw e
}
var ShellService = require('./shellService.js')
var Config = require('./configService.js')

function Controller() {
    this.config = Config.loadSConfig(true)
    var ban = Config.loadBan()
    var skins = {
        andrews54757: 'https://avatars1.githubusercontent.com/u/13282284?v=3&s=460',
        legitsoulja: 'https://avatars2.githubusercontent.com/u/4976824?v=3&s=400'
    }

    this.globalData = new GlobalData(this.config, ban, skins);
    this.shellService = new ShellService(this)
    this.serverService = new ServerService(this, this.globalData);

}

Controller.prototype.start = function () {
    this.shellService.init()
    this.serverService.start();

}
Controller.prototype.execCommand = function (str) {
    this.serverService.execCommand(str)
}
module.exports = Controller;