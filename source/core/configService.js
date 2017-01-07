'use strict';
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
const fs = require("fs");
const ini = require('../modules/ini.js');


module.exports = {

    loadSConfig: function (d) {
        try {
            var config = ini.parse(fs.readFileSync(__dirname + '/../settings/serverConfig.ini', "utf8"))
            console.log("gre{[OpenAgar]} Loaded server configs".styleMe())
            return config;

        } catch (e) {
            if (d) {
                console.log("red{[OpenAgar]} Error with getting config:".styleMe())
                throw e
            }
            return false
        }
    },
    loadSkins: function (d) {
        try {
            var skins = ini.parse(fs.readFileSync(__dirname + '/../settings/customSkins.ini', "utf8"))
            console.log("gre{[OpenAgar]} Loaded custom skins".styleMe())
            return skins;

        } catch (e) {
            if (d) {
                console.log("red{[OpenAgar]} Error with getting custom skins:".styleMe())
                throw e
            }
            return false
        }
    },
    loadBan: function () {
        var ban = [];
        try {
            var file = fs.readFileSync(__dirname + '/../../ban.txt', "utf8")
            console.log("gre{[OpenAgar]} Loaded ban file and cleaned it".styleMe())
            if (!file) return ban
            file = file.split("\n")

            file.forEach((b) => {
                if (b) {
                    b = b.replace(/\s/g, "")

                    ban.push(b)
                }
            })

            fs.writeFileSync(__dirname + '/../../ban.txt', ban.join("\n"))
        } catch (e) {

            console.log("yel{[OpenAgar]} Ban file not found. Generating...".styleMe())
            fs.writeFileSync(__dirname + '/../../ban.txt', "")
        }
        return ban
    },
    loadConfig: function (dir, d) {
        try {
            var physics = ini.parse(fs.readFileSync(dir + '/physicsConfig.ini', "utf8"))
            var config = ini.parse(fs.readFileSync(dir + '/config.ini', "utf8"))
            var client = ini.parse(fs.readFileSync(dir + '/clientConfig.ini', "utf8"))
            for (var i in physics) {
                if (!config[i]) config[i] = physics[i]
            }
            for (var i in client) {
                if (!config[i]) config[i] = client[i]
            }
            console.log("gre{[OpenAgar]} Loaded game server configs".styleMe())
            return config;

        } catch (e) {
            if (d) {
                console.log("red{[OpenAgar]} Error with getting config:".styleMe())
                throw e
            }
            return false
        }


    },
    loadServers: function (defaultconf) {
        var servers = {};
        var files = fs.readdirSync(__dirname + '/../settings/servers/');
        files.forEach((file) => {
            var split = file.split(".");
            if (split[1] != "ini") return;

            var f = __dirname + '/../settings/servers/' + file;
            var configs = ini.parse(fs.readFileSync(f, "utf8"));
            for (var i in defaultconf) {
                if (configs[i] === undefined) configs[i] = defaultconf[i];
            }
            servers[split[0]] = configs;

        })
        return servers;
    }



};