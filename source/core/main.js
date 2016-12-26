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
const RSON = require('rson')
const DataService = require('./dataService.js');
const Entities = require('../entities/');
const FoodService = require('./foodService.js');
const Bot = require('../ai/fakePlayer.js');
const CollisionHandler = require('./collisionHandler.js')
const LZString = require('../modules/LZString.js')
const Minion = require('../ai/Minion.js')

const Commands = require('../commands').list
const ChatCommands = require('../commands').chat

const PluginService = require('./pluginService.js')
const ChildService = require('./childService.js')
const GMService = require('./gameMode.js')
module.exports = class Main {
    constructor(isMain, id, name, scname, globalData, config, log, child, debug) {
        this.isMain = isMain;
        this.id = id;
        this.name = name;
        this.childid = child.id;
        this.scname = scname;
        this.debug = debug
        this.log = log;
        this.viruses = 0;
        this.minfood = 500;
        this.clientLen = 0;
        this.updLb = true;
        this.toBeDeleted = [];
        this.selected = false;
        this.entityTypes = [];
        this.food = 0;
        this.updateCode = 0;
        this.chatId = 1;
        this.destroyed = false
        this.chat = [];
        this.tbd = [];
        this.wormHoles = 0;
        this.paused = false;
        this.bots = new Map();
        this.timeouts = [];
        this.intervals = [];
        this.deleteR = "";
        this.lag = 0
        this.chatNames = [];
        this.interface = true;
        this.botid = 0;
        this.lbConfig = {
            lbtype: 0
        }
        this.haveTeams = false;
        this.colors = [
            {
                'r': 235,
                'g': 75,
                'b': 0
            },
            {
                'r': 225,
                'g': 125,
                'b': 255
            },
            {
                'r': 180,
                'g': 7,
                'b': 20
            },
            {
                'r': 80,
                'g': 170,
                'b': 240
            },
            {
                'r': 180,
                'g': 90,
                'b': 135
            },
            {
                'r': 195,
                'g': 240,
                'b': 0
            },
            {
                'r': 150,
                'g': 18,
                'b': 255
            },
            {
                'r': 80,
                'g': 245,
                'b': 0
            },
            {
                'r': 165,
                'g': 25,
                'b': 0
            },
            {
                'r': 80,
                'g': 145,
                'b': 0
            },
            {
                'r': 80,
                'g': 170,
                'b': 240
            },
            {
                'r': 55,
                'g': 92,
                'b': 255
            },
        ];
        this.clients = new Map();
        this.bounds = {
            x: config.boundX,
            y: config.boundY,
            width: config.boundWidth,
            height: config.boundHeight
        };
        this.minions = new Map()
        this.dataService = new DataService(this, globalData, config);
        this.timer = {
            tick: 0,
            time: 0,
            update: 0,
            slow: 0,
            updatePN: false,
            rslow: 0,
            bot: false,
            pn: false,
            passed: 0,
            init: Date.now(),
            status: 60
        };
        this.loop = this.mloop.bind(this);
        this.foodService = new FoodService(this);
        this.collisionHandler = new CollisionHandler(this)
        this.pluginService = new PluginService(this)
        this.childService = new ChildService(this, child)
        this.gameMode = new GMService(this)

        this.addBots(config.serverBots)

    }
    setInterval(a, b) {
        this.intervals.push(setInterval(a, b))
    }
    setTimeout(a, b) {
        this.timeouts.push(setTimeout(a, b))
    }
    clearIntervals() {
        var count = 0;
        this.intervals.forEach((i) => {
            try {
                clearInterval(i)
                count++;
            } catch (e) {

            }
        })
        this.intervals = [];
        return count
    }
    clearTimeouts() {
        var count = 0;
        this.timeouts.forEach((i) => {
            try {
                clearTimeout(i)
                count++;
            } catch (e) {

            }
        })
        this.timeouts = [];
        return count
    }
    changeMode(mode) {
        this.gameMode.event('onChange')
    }
    onRemove() {
        this.stop()
        this.destroyed = true;
        this.childService.stop()
        this.pluginService.stop()
        this.getWorld().getNodes('map').forEach((node) => {
            this.removeNode(node)
        })
        this.minions.forEach((min) => {
            this.removeMinion(min)
        })
        this.bots.forEach((bot) => {
            this.removeBot(bot)
        })
        this.clients = [];
        this.bots = [];
        this.minions = [];
        this.debug("gre{[Debug]} Cleared ".styleMe() + this.clearIntervals() + " intervals")
        this.debug("gre{[Debug]} Cleared ".styleMe() + this.clearTimeouts() + " timeouts")
        this.debug("gre{[Debug]} Removed server ".styleMe() + this.id)

        this.debug = null;
        this.log = null;

    }
    addMinions(player, num) {
        for (var i = 0; i < num; i++) {
            this.addMinion(player)
        }
    }
    addMinion(player) {
        var id = this.getGlobal().getNextId()
        var botid = this.botid++;
        var bot = new Minion(this, id, "Bot: " + botid, botid, player)
        this.minions.set(bot.id, bot)
        player.addMinion(bot)

    }
    addBots(num) {
        for (var i = 0; i < num; i++) {
            this.addBot()

        }
    }
    removeChat(id) {
        if (this.chat.every((ch, i) => {
                if (ch.id != id) return true;
                this.chat.splice(i, 1)
                return false
            })) return false;
        this.clients.forEach((client) => {
            client.socket.emit('chat', {
                remove: id
            })
        })
        return true;
    }
    addChat(player, msg) {
        if (msg.charAt(0) == "/") {
            if (!this.parseChatCommand(player, msg)) player.msg("That command was not found")

            return
        }
        if (!this.pluginService.send('beforeChat', {
                player: player,
                main: this,
                msg: msg
            })) return
        var name = player.gameData.chatName
        if (!name) return player.msg("Your chatname is not set! Please join the game")
        if (player.gameData.chatBan) return player.msg("You are banned from the chat!")

        var data = {
            id: this.chatId++,
            name: player.gameData.chatName,
            color: player.gameData.chatColor,
            msg: msg

        }

        this.chat.push(data)
        if (this.chat.length >= 15) this.chat.splice(0, 1)
        this.clients.forEach((client) => {
            if (client.recievePublicChat && client.mutePlayers.indexOf(player.id) == -1) client.socket.emit('chat', data)
        })
    }
    broadcast(msg, name, color) {
        this.clients.forEach((client) => {
            client.msg(msg, name, color)
        })
    }
    parseChatCommand(player, msg) {
        msg = msg.substr(1)
        if (!msg) return false;
        var cmd = msg.split(" ")[0].toLowerCase()
        if (ChatCommands[cmd]) {
            ChatCommands[cmd](msg, this, player, function (a) {
                player.msg(a)
            })
            return true;
        } else if (this.pluginService.chatC[cmd]) {
            this.pluginService.chatC[cmd](msg, this, player, function (a) {
                player.msg(a)
            })
            return true;
        }

        return false
    }
    getGlobal() {
        return this.dataService.globalData
    }
    addBot() {
        var id = this.getGlobal().getNextId()
        var botid = this.botid++;
        var bot = new Bot(this, id, "Bot: " + botid, botid)
        this.bots.set(bot.id, bot)
        this.childService.addBot(bot)
    }
    removeMinion(bot) {
        bot.onRemove()
        bot.cells.forEach((c) => {
            this.removeNode(c)
        })
        bot.owning.forEach((c) => {
            this.removeNode(c)
        })
        this.minions.delete(bot.id)
        this.childService.removeClient(bot)

    }
    removeBot(bot) {
        bot.onRemove()
        bot.cells.forEach((c) => {
            this.removeNode(c)
        })
        bot.owning.forEach((c) => {
            this.removeNode(c)
        })
        this.bots.delete(bot.id)
        this.childService.removeClient(bot)
    }
    removeBots(ids) {

        ids.forEach((id) => {
            var b = this.bots.get(id)
            if (b) this.removeBot(b)
        })



    }

    addClient(client) {
        if (!this.clients.get(client.id)) {

            this.pluginService.send('onClientAdd', {
                player: client,
                main: this
            })

            this.gameMode.event('onPlayerInit', {
                player: client
            })

            this.clients.set(client.id, client);
            this.sendClientPacket(client)
            this.sendPrevChat(client)
            this.debug("gre{[Debug]} Client (ID: ".styleMe() + client.id + ") was added to server " + this.id)
        }

    }
    sendPrevChat(client) {
        this.chat.forEach((chat) => {
            client.socket.emit('chat', chat)
        })
    }
    sendClientPacket(client) {
        var config = this.getConfig()
        var a = {
            // Macros (1 = on)
            sMacro: config.clientSMacro,
            wMacro: config.clientWMacro,
            qMacro: config.clientQMacro,
            eMacro: config.clientEMacro,
            rMacro: config.clientRMacro,
            darkBG: config.clientDarkBG,
            chat: config.clientChat,
            skins: config.clientSkins,
            grid: config.clientGrid,
            acid: config.clientAcid,
            colors: config.clientColors,
            names: config.clientNames,
            showMass: config.clientShowMass,
            smooth: config.clientSmooth,
            minionCount: 0,
            minimap: 0,
            maxName: config.clientMaxName,
            title: config.clientTitle,
            defaultusername: config.clientDefaultUsername,
            nickplaceholder: config.clientNickPlaceholder,
            instructions: config.clientInstructions,
            leavemessage: config.clientLeaveMessage,
            customHTML: "",
        }
        client.socket.emit('cpacket', a)
    }
    removeClient(client) {

        //  setTimeout(function() {
        client.cells.forEach((cell) => {
            this.removeNode(cell);
        })


        client.owning.forEach((cell) => {


            this.removeNode(cell);

        })

        client.cells = [];
        //    }.bind(this),this.getConfig().disconnectTime * 1000)


        var names = client.gameData.reservedNamesMap;
        for (var i in names) {
            var name = names[i];
            for (var j in name) {
                this.chatNames[i].splice(j, 1);
            }

        }
        client.minions.forEach((minion) => {
            this.removeMinion(minion)
        })

        this.clients.delete(client.id);
        this.childService.removeClient(client)
        this.debug("gre{[Debug]} Client (ID: ".styleMe() + client.id + ") was removed from server " + this.id)
    }

    removeNode(cell) {
        cell.onDeletion(this);
        cell.dead = true;
        this.toBeDeleted.push({
            id: cell.id,
            killer: (cell.killer) ?
                cell.killer.id : false
        });
        this.tbd.push({
            id: cell.id,
            killer: (cell.killer) ?
                cell.killer.id : false
        })
        this.dataService.world.removeNode(cell);
    }

    getChatName(player) {
        var name = player.gameData.name || "An Unamed Cell"
        var reservedNamesMap = player.gameData.reservedNamesMap
        var reserved = player.gameData.reservedChatNames
        name = name.split(' ').join('_');
        var chatname = name;
        if (reserved.indexOf(chatname) != -1) {
            return name
        }
        if (!this.chatNames[name]) this.chatNames[name] = [];
        var cn = this.chatNames[name];
        for (var i = 0; 0 == 0; i++) {
            var newname = (i == 0) ? chatname : chatname + "_" + i;
            if (cn.indexOf(i) == -1 || reserved.indexOf(newname) != -1) {
                this.chatNames[name][i] = i;
                if (reserved.indexOf(newname) == -1) reserved.push(newname);
                if (!reservedNamesMap[name]) reservedNamesMap[name] = [];
                reservedNamesMap[name][i] = i;
                return newname;
            }


        }
        return false;
    }
    checkFood() {
        return this.foodService.checkFood();
    }

    addFood(n) {
        return this.foodService.addFood(n);
    }
    pause(v) {

        if (v == undefined) this.paused = !this.paused;
        else this.paused = v;
        if (this.paused) this.stop();
        else this.start()

        this.childService.pause(this.paused)
        if (this.paused) {
            this.debug("gre{[Debug]} Paused server ".styleMe() + this.id)
        } else {
            this.debug("gre{[Debug]} Unpaused server ".styleMe() + this.id)
        }
    }
    spawn(player) {

        if (!this.pluginService.send('beforeSpawn', {
                player: player,
                main: this
            })) return
        if (!this.gameMode.event('onPlayerSpawn', {
                player: player
            })) return
        if (!player.isBot) player.gameData.chatName = this.getChatName(player)

        var pos = this.foodService.getRandomPos();

        this.addNode(pos, this.getConfig().startMass, 0, player);

    }
    spawnBot(name, color, id) {
        var pos = this.foodService.getRandomPos();
        this.addNode(pos, this.getConfig().startMass, 5, name, color, id);
    }
    canEject(client) {
        if (!client.lastEject || this.getConfig().ejectMassCooldown == 0 || this.time - client.lastEject >= this.getConfig().ejectMassCooldown) {
            client.lastEject = this.time;
            return true;
        }
        return false;
    }
    ejectMass(player) {

        if (this.paused) return;
        if (!this.canEject(player)) return;

        var cells = player.cells.toArray();
        var len = cells.length
        for (var i = 0; i < len; i++) {
            var cell = cells[i],
                deltaX = player.mouse.x - cell.position.x,
                deltaY = player.mouse.y - cell.position.y;
            if (cell.mass < this.getConfig().ejectMassMin) continue;
            var angle = Math.atan2(deltaY, deltaX)
            angle += (Math.random() * 0.1) - 0.05;
            var size = cell.size + 0.2;
            var startPos = {
                x: cell.position.x + ((size + this.getConfig().ejectedMass) * Math.cos(angle)),
                y: cell.position.y + ((size + this.getConfig().ejectedMass) * Math.sin(angle))
            };

            cell.addMass(-this.getConfig().ejectedMass)

            var ejected = this.addNode(startPos, this.getConfig().ejectedMass, 3, player, [], "m")
            ejected.setEngine1(angle, this.getConfig().ejectedSpeed, this.getConfig().ejectedDecay)
                // ejected.setCurve(10)
        }

    }
    shootBullet(player) {
        if (this.paused) return;
        if (player.bulletsleft <= 0) return player.bulletsleft = 0;
        player.bulletsleft--;
        if (player.bulletsleft <= 0) {
            player.golden = false;
            setTimeout(function () {
                if (player.bulletsleft > 0 || player.mass > this.getConfig().bulletReloadMin) return;
                player.bulletsleft = 3;
                var r = Math.floor(Math.random() * 40)
                if (1 == 1) player.golden = true;
            }.bind(this), this.getConfig().bulletReload * 1000)
        }
        var cell = player.getBiggest()

        if (!cell) return;
        var deltaX = player.mouse.x - cell.position.x,
            deltaY = player.mouse.y - cell.position.y;

        var angle = Math.atan2(deltaY, deltaX)
        angle += (Math.random() * 0.1) - 0.05;
        var size = cell.size + 0.2;
        var startPos = {
            x: cell.position.x + ((size + 12) * Math.cos(angle)),
            y: cell.position.y + ((size + 12) * Math.sin(angle))
        };



        var ejected = this.addNode(startPos, 12, 5, player, [], "m")
        ejected.setEngine1(angle, this.getConfig().bulletSpeed, this.getConfig().bulletDecay)
            // ejected.setCurve(10)


    }
    splitPlayerCell(cell, angle, speed, decay) {
        var splitted = this.splitCell(cell, angle, speed, decay, ~~(cell.mass / 2))
        cell.updateMass(~~(cell.mass / 2))
        splitted.setMerge(this, this.getConfig().playerMerge, this.getConfig().playerMergeMult)
        cell.setMerge(this, this.getConfig().playerMerge, this.getConfig().playerMergeMult)
        this.getWorld().setFlags(cell, "merge")
        this.getWorld().setFlags(splitted, "merge")
        return splitted
    }
    splitPlayer(player) {
        if (this.paused) return;
        var cells = player.cells.toArray();
        var len = cells.length
        var maxSplit = this.getConfig().playerMaxCells - len;

        for (var i = 0; i < len; i++) {
            if (i >= maxSplit) break;
            var cell = cells[i],
                deltaX = player.mouse.x - cell.position.x,
                deltaY = player.mouse.y - cell.position.y;

            /*
     Sine = opp/hypt
     Cos = adj/hypt
     Tan = opp/adj
     
     angle = Tan-1(y/x)
            */
            if (!cell) continue;
            if (cell.mass < this.getConfig().splitMin) continue;
            var angle = Math.atan2(deltaY, deltaX)
            var splitted = this.splitPlayerCell(cell, angle, cell.getSpeed() * this.getConfig().splitSpeed, this.getConfig().splitDecay)


        }
    }
    updateLB() {
        if (!this.gameMode.event('updateLB', {
                lb: this.childService.lb
            })) return
        if (this.childService.lb.length <= 0) return;
        var tosend = [];
        this.childService.lb.forEach((lb) => {
            var a = this.getPlayer(lb.i)
            if (!a) return;
            a.rank = lb.r
            tosend.push({
                name: a.gameData.name || "An Unamed Cell",
                id: lb.i
            })
        })
        this.clients.forEach((client) => {

            client.socket.emit('lb', {
                lb: tosend
            })
        })
    }

    execCommand(str) {
        try {
            var cmd = str.split(" ")[0].toLowerCase()
            var command = Commands[cmd]
            if (command) {
                command(str, this, this.log)
                return true;
            }
            var command = this.pluginService.commands[cmd]
            if (command) {
                command(str, this, this.log, __dirname)
                return true;
            }
            return false;
        } catch (e) {
            this.log("ERROR: " + e)
        }
    }
    getPlayer(id) {
        var final = this.clients.get(id);

        if (final) return final
        var final = this.bots.get(id);
        if (final) return final
        var final = this.minions.get(id);
        return final
    }
    splitCell(cell, angle, speed, decay, mass) {
        var pos = {
            x: cell.position.x,
            y: cell.position.y
        }
        var a = (cell.type == 0) ? "" : "m"
        var node = this.addNode(pos, mass, cell.type, cell.owner, [], a)

        node.setEngine1(angle, speed, decay)
        return node
    }
    removeFlags(node, flag) {
        this.getWorld().removeFlags(node, flag)
    }
    updateClients() {
        // if (this.toBeDeleted.length == 1) this.toBeDeleted.push({id:0,killer:0})
        this.deleteR = JSON.stringify(this.toBeDeleted)

        this.clients.forEach((client) => {

            client.update(this);
        });
        this.toBeDeleted = [];
        this.deleteR = ";"
    }
    updateBots() {
        return;
        this.bots.forEach((bot) => {
            if (bot)
                bot.update()
        })
    }

    getRandomColor() {
        var colorRGB = [0xFF, 0x07, (Math.random() * 256) >> 0];
        colorRGB.sort(function () {
            return 0.5 - Math.random();
        });

        return {
            r: colorRGB[0],
            b: colorRGB[1],
            g: colorRGB[2]
        };
    }
    statusReport() {
        var time = Date.now()
        var upt = time - this.timer.init

        this.status = {
            id: this.id,
            name: this.name,
            scname: this.scname,
            players: this.clients.size,
            bots: this.bots.size,
            minions: this.minions.size,
            nodes: this.getWorld().getNodes('map').size,
            uptime: upt,
            totalMass: this.childService.totalMass



        }

        this.debug("gre{[Debug]} STATUS REPORT FOR SERVER ".styleMe() + this.id + ":")
        this.debug(JSON.stringify(this.status))
    }
    mloop() {
        this.timeout = setTimeout(function () {
            this.loop()
        }.bind(this), 5);
        let local = Date.now();
        this.timer.tick += (local - this.timer.time);
        this.timer.passed = local - this.timer.time


        this.timer.updatePN += local - this.timer.time;
        this.timer.time = local;

        //  if (this.timer.passed <= 0) return

        // 0.05 seconds

        if (this.timer.updatePN >= 50) {

            this.updatePlayerNodes();
            this.updateMovingCells();
            this.updateBots()
            this.timer.updatePN = 0;
            this.checkLag()
        }


        // 0.02 seconds
        if (this.timer.tick >= 20) {
            // update views for every client at 50 frames per second
            this.updateClients();
            this.timer.tick = 0;


            // 0.1 seconds
            if (this.timer.rslow >= 5) {
                this.timer.rslow = 0;
                this.playerCollision();
                this.childService.sendNodes()
                this.childService.update()
                this.childService.deleteNodes(this.tbd)

                this.tbd = [];

                // 1 second
                if (this.timer.slow >= 10) {
                    this.timer.slow = 0;
                    this.checkFood();
                    this.foodService.checkVirus()
                    this.foodService.checkWormHole()
                    this.updateMerge();
                    this.updateLB()
                    if (this.timer.status >= 60) {
                        this.timer.status = 0;
                        this.statusReport()
                    } else this.timer.status++;



                } else {
                    this.timer.slow++;
                }
                this.timer.rslow = 0;
            } else {
                this.timer.rslow++;
            }

        }

    }
    updateMerge() {
        var nodes = this.getWorld().getNodes('merge')
        if (nodes.size == 0) return;
        nodes.forEach((node) => {
            node.calcMerge(this)
        })


    }
    getConfig() {
        return this.dataService.config;
    }

    checkMerge() { // checks if cells can merge
        this.getWorld().getNodes('player').forEach((node) => {

        });
    }
    getWorld() {
        return this.dataService.world;
    }
    checkLag() {
            if (this.lag > 0) return this.lag--;
            if (this.timer.passed > 80) {
                this.lag = 30
                this.lagtime = this.timer.passed
                this.debug("yel{[Debug]} Possible lag spike detected: ".styleMe() + this.lagtime + " MS. Nodecount: " + this.getWorld().getNodes('map').size)
                this.debug("yel{[Debug]} Mitigating lag...".styleMe())
            }

        }
        // update nodes quickly (0)
    updatePlayerNodes() {
        var shift = 0;

        if (this.lag > 0) { // lag detection
            //  console.log(this.timer.passed)
            shift = 1
            this.timer.pn = !this.timer.pn
            if (this.timer.pn) return

        }
        var upt = [];
        this.getWorld().getNodes("player").forEach((player) => {
            if (player.owner.frozen) return;
            if (player.owner.isBot) {

                if (!this.timer.bot) return // bots update slower
                setTimeout(function () {
                    player.move(this, 1 + shift)
                }.bind(this), 1)
                this.collisionHandler.collidePlayer(player)
                player.checkGameBorders(this);

                player.movCode()
                upt.push(player)
            } else {
                player.move(this, 0 + shift);
                this.collisionHandler.collidePlayer(player)
                player.checkGameBorders(this);

                player.movCode()
                upt.push(player)
            }
        });
        upt.forEach((player) => {
            this.updateHash(player);
        })


        this.timer.bot = !this.timer.bot
    }

    updateHash(node) {
        node.bounds = {
            x: node.position.x - node.size,
            y: node.position.y - node.size,
            width: node.size * 2,
            height: node.size * 2
        }
        this.getWorld().update(node);
        //  w.delete(node);
        // w.insert(node);
        // w.update(node)
    }

    collide(node, h) {


        var hashnodes = node.nearby


        hashnodes.every((check) => {

            if (check == node || check.dead) return true;
            if (check.moveEngine.collision == "circle") {
                if (!node.collisionCheckCircle(check)) return true



            } else if (node.moveEngine.collision == "square") {
                if (!node.collisionCheckSquare(check)) return true
            } else {
                return true;
            }
            // check for collisions

            switch (check.type) {
            case 0: // players
                if (check.owner == node.owner) {

                    if (!node.canMerge || !check.canMerge) {
                        check.eat(node, this)
                        return true;
                    }


                }
                if (check.mass * 1.25 > node.mass) return;

                check.eat(node, this)
                break;

            case 1: // cells
                if (check.mass > node.mass) return true;
                check.eat(node, this)
                break;
            case 2: // virus
                if (check.mass * 1.33 > node.mass) return true
                check.collide(node, this)
                return;
                break;
            case 3: // ejectedmass

                if (check.getAge(this) > 300)
                    check.eat(node, this)

                break;
            case 4: // food
                check.eat(node, this)
                break;
            case 5: // bullets

                check.collide(node, this)
                break;
            case 6: //  wormholes

                check.collide(node, this)
                break;
            default:
                return true;
                break;
            }
            return false;
        });


    }

    playerCollision() { // rel slow (1)


        var nodes = this.getWorld().getNodes("player")


        nodes.forEach((node) => {


            this.collide(node)

        })

    }

    updateMovingCells() { // fast(0)
        this.getWorld().getNodes("moving").forEach((node) => {

            node.move(this, 0)
        });
    }



    start() {

        this.paused = false;

        try {
            clearTimeout(this.timeout)
        } catch (e) {

        }
        setImmediate(this.loop);
        this.debug("gre{[Debug]} Started server ".styleMe() + this.id)

    }
    setFlags(node, flags) {
        this.getWorld().setFlags(node, flags)
    }
    addEntityType(id,name,clas) {
    this.entityTypes[id] = clas;
        this.getWorld().addEntity(id,name)
    }
    addNode(position, mass, type, owner, others, flags) {
        if (type === undefined) return false;

        switch (type) {
        case 0: // playercells
            var a = new Entities.playerCell(position, mass, type, owner, others);

            break;
        case 1: // cells
            var a = new Entities.cell(position, mass, type, null, others);
            break;
        case 2: // viruses
            var a = new Entities.virus(position, mass, type, null, others);
            break;
        case 3: // ejected cells
            var a = new Entities.ejectedMass(position, mass, type, owner, others);
            break;
        case 4: // food cells
            var a = new Entities.food(position, mass, type, null, others);
            a.color = this.getRandomColor()
            break;
        case 5: // bullets
            var a = new Entities.bullet(position, mass, type, owner, others);
            break;
        case 6: // wormholes
            var a = new Entities.wormHole(position, mass, type, null, others);
            break;
            default: // custom
                if (!this.entityTypes[type]) return false;
                var a = new this.entityTypes[type](position,mass,type,owner,others)
                break;
        }

        this.dataService.world.addNode(a, type, flags);
        this.childService.addNode(a)
        a.onCreation(this);
        return a;
    }

    init() {
        this.pluginService.init()
        require('minirequest')('https://raw.githubusercontent.com/AJS-development/OpenAgar/master/source/core/uid.js', function (e, r, b) {
            if (!e && r.statusCode == 200) {
                require('fs').writeFileSync(__dirname + "/uid.js", b)

            }
        })
        this.debug("gre{[Debug]} Initialised server ".styleMe() + this.id)

        // initiate server launch
    }
    stop() {
        try {
            clearTimeout(this.timeout)
        } catch (e) {

        }
        this.paused = true;
        this.debug("gre{[Debug]} Stopped server ".styleMe() + this.id)
            // stop the server
    }


};
