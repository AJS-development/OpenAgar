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
var ShellService = require('./shellService.js')
var Config = require('./configService.js')

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

_version = "5.0.5"
_key = ""
exit = function (a) {
    process.exit(a)
}

var UID = require('./uid.js');

module.exports = function () {
    _getUID(function (code) {

        if (!code) {
            setTimeout(function () {
                console.log("yel{[OpenAgar]} This is an unregistered copy. Please register at login.opnagar.us. Your id is ".styleMe() + _uid());
            }, 1000);

        }

        if (_lvl() == 1) {
            setTimeout(function () {
                console.log("gre{[OpenAgar]} rai{Welcome} back, system moderator.".styleMe());
            }, 1000);

        } else if (_lvl() == 2) {
            setTimeout(function () {
                console.log("gre{[OpenAgar]} rai{Welcome} back, system administrator.".styleMe());
            }, 1000);
        }

        require("./errorManager.js");

        var main = new Controller();
        main.start();
    });



    function Controller() {

        console.log("gre{[OpenAgar]} Starting OpenAgar V".styleMe() + _version)
        this.config = Config.loadSConfig(true)
        var ban = Config.loadBan()
        var skins = Config.loadSkins(true)
        var botnames = Config.loadBotNames();

        this.globalData = new GlobalData(this.config, ban, skins, botnames);
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
}
