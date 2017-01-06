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

/** Class that represents a game server */
class Main {
    /** 
     * Creates a game server
     * @param {Boolean} isMain - Tells if the server is the main server
     * @param {Number} id - Id of server
     * @param {String} name - Name of server
     * @param {String} scname - Screen name of server
     * @param {GlobalData} globalData - Global data object
     * @param {Object} config - Object of server's config
     * @param {Function} log - Log function
     * @param {Child} child - The assigned child process
     * @param {Function} debug - The debug function
     */
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
        this.collist = [];
        this.bots = new Map();
        this.timeouts = [];
        this.intervals = [];
        this.feedListeners = [];
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
        this.childService.init()
        this.addBots(config.serverBots)


    }

    /** 
     * Sets an interval so it can be removed when the server shuts down
     * @param {Function} func - The function to call at a interval
     * @param {Number} time - The interval time
     * @return {Interval} The interval created from this function
     */

    setInterval(func, time) {
        var interval = setInterval(func, time);
        this.intervals.push(interval);
        return interval;
    }

    /** 
     * Sets an timeout so it can be removed when the server shuts down
     * @param {Function} func - The function to call at after the timeout
     * @param {Number} time - The time to wait for the function to be called
     * @return {Timeout} The timeout created from this function
     */

    setTimeout(func, time) {
        var timeout = setTimeout(func, time)
        this.timeouts.push(timeout)
        return timeout;
    }

    /**
     * Clears all intervals
     * @return {Number} The count of intervals removed
     */

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

    /**
     * Clears all timeouts
     * @return {Number} The count of timeouts removed
     */

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

    /**
     * Changes the gamemode
     * @param {Number} mode - Gamemode id to switch to
     * @deprecated Is not functional
     */

    changeMode(mode) {
        this.gameMode.event('onChange')
    }

    /**
     * Called when the server is removed
     */

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

    /**
     * Adds minions for a player
     * @param {Player} player - Player to give minions to
     * @param {Number} num - Amount of minions to give
     */

    addMinions(player, num) {
        for (var i = 0; i < num; i++) {
            this.addMinion(player)
        }
    }

    /**
     * Formats a node to be sent
     * @param {Node} node - Node to be sent
     * @param {Player} player - Player that it is being sent to
     * @returns {Object} Formated node
     */

    formatNode(node, player) {

        var a = {
            id: node.id,
            owId: (node.owner) ? node.owner.id : 0,
            size: node.size,
            mass: node.mass,
            type: node.type,
            posX: node.position.x,
            posY: node.position.y,
            color: node.color
        };
        node.name && (a.name = node.name)
        node.agit && (a.agit = 1)
        node.skin && (a.skin = player.skinHandler.getSend(node.skin))

        node.spiked && (a.spiked = 1);
        return a;
    }

    /**
     * Adds a single minion for a player
     * @param {Player} player - Player to give the minion to
     */

    addMinion(player) {
        var id = this.getGlobal().getNextId()
        var botid = this.botid++;
        var bot = new Minion(this, id, "Bot: " + botid, botid, player)
        this.gameMode.event('onAllInit', {
            player: bot
        })
        this.minions.set(bot.id, bot)
        player.addMinion(bot)

    }

    /**
     * Adds server bots
     * @param {Number} num - Amount of bots to add
     */

    addBots(num) {
        for (var i = 0; i < num; i++) {
            this.addBot()

        }
    }

    /**
     * Removes a chat entry
     * @param {Number} id - Id of chat entry to remove
     * @returns {Boolean} Returns whether it was sucessful or not
     */

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

    /**
     * Adds a chat entry
     * @param {Player} player - Player who chatted
     * @param {String} msg - Msg to chat
     */

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

    /**
     * Broadcays a chat message
     * @param {String} msg - Message to send
     * @param {String} name - Name to send as
     * @param {Object} color - Color to send as
     */

    broadcast(msg, name, color) {
        this.clients.forEach((client) => {
            client.msg(msg, name, color)
        })
    }

    /**
     * Parses a chat command
     * @param {Player} player - Player that is issueing the command
     * @param {String} msg - String of command
     * @returns {Boolean} Returns whether the command was executed or not
     */

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

    /**
     * Gets global data
     * @returns {GlobalData} Returns the globaldata object
     */

    getGlobal() {
        return this.dataService.globalData
    }

    /**
     * Adds a bot
     */

    addBot() {
        var id = this.getGlobal().getNextId()
        var botid = this.botid++;
        var bot = new Bot(this, id, "Bot: " + botid, botid)
        this.gameMode.event('onAllInit', {
            player: bot
        })
        this.bots.set(bot.id, bot)
        this.childService.addBot(bot)
    }

    /**
     * Removes a minion
     * @param {Minion} bot - Minion to remove
     */

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

    /**
     * Removes a bot
     * @param {Bot} bot - Bot to remove
     */

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

    /**
     * Removes bots from a list of ids
     * @param {Array} ids - array of botids 
     */

    removeBots(ids) {

        ids.forEach((id) => {
            var b = this.bots.get(id)
            if (b) this.removeBot(b)
        })



    }

    /**
     * Adds a client to the server
     * @param {Player} client - Player to add to the server
     */

    addClient(client) {
        if (!this.clients.get(client.id)) {

            this.pluginService.send('onClientAdd', {
                player: client,
                main: this
            })

            this.gameMode.event('onPlayerInit', {
                player: client
            })
            this.gameMode.event('onAllInit', {
                player: client
            })
            this.clients.set(client.id, client);
            this.sendClientPacket(client)
            this.sendPrevChat(client)
            this.debug("gre{[Debug]} Client (ID: ".styleMe() + client.id + ") was added to server " + this.id)
        }

    }

    /**
     * Sends the chat log to the client
     * @param {Player} player - player to send chat log
     */

    sendPrevChat(player) {
        this.chat.forEach((chat) => {
            player.socket.emit('chat', chat)
        })
    }

    /**
     * Sends a player's client instructions
     * @param {Player} player - Player to send data to
     */

    sendClientPacket(player) {
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
        player.socket.emit('cpacket', a)
    }

    /**
     * Removes a player from the server
     * @param {Player} client - Player to remove
     */

    removeClient(client) {

        //  setTimeout(function() {
        client.cells.forEach((cell) => {
            this.removeNode(cell);
        })


        client.owning.forEach((cell) => {


            this.removeNode(cell);

        })

        client.cells.clear();
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

    /**
     * Removes all nodes in the game
     */

    reset() {
        this.getWorld().getNodes('map').forEach((node) => {
            this.removeNode(node);
        });
        this.getWorld().clear()
    }

    /**
     * Removes a node from the game
     * @param {Node} cell - Node to remove
     */

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

    /**
     * Gets a player's chatname
     * @param {Player} player - Player to get chatname
     * @returns {(String|Boolean)} - Returns the chatname
     */

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

    /**
     * Checks if there is enough food cells
     */

    checkFood() {
        return this.foodService.checkFood();
    }

    /**
     * Adds food cells
     * @param {Number} n - Amount of food cells to add
     */

    addFood(n) {
        return this.foodService.addFood(n);
    }

    /**
     * Pauses/unpauses the server
     * @param {Boolean} [v] - State to set
     */

    pause(v) {

        if (v === undefined) this.paused = !this.paused;
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

    /**
     * Spawns a player into the game
     * @param {Player} player - Player to spawn
     */

    spawn(player) {
        if (player.cells.size > 0) return
        if (!this.pluginService.send('beforeSpawn', {
                player: player,
                main: this
            }));
        if (!this.gameMode.event('onPlayerSpawn', {
                player: player
            }));
        if (!player.isBot) player.gameData.chatName = this.getChatName(player)

        var pos = this.foodService.getRandomPos();

        this.addNode(pos, this.getConfig().startMass, 0, player);

    }

    /**
     * Checks whether a player can eject mass or not
     * @param {Player} client - Player to check
     * @returns {Boolean} Whether player can eject or not
     */

    canEject(client) {
        if (!client.lastEject || this.getConfig().ejectMassCooldown == 0 || this.timer.time - client.lastEject >= this.getConfig().ejectMassCooldown) {
            client.lastEject = this.timer.time;
            return true;
        }
        return false;
    }

    /**
     * Checks a playercell if it has requirements to eject
     * @param {Node} cell - Playercell to check
     * @returns {Boolean} Whether the cell can eject or not
     */

    ejectCheck(cell) {
        if (cell.mass < this.getConfig().ejectMassMin) return false;
        cell.addMass(-this.getConfig().ejectedMass);
        return true;
    }

    /**
     * Ejects mass from a player
     * @param {Player} player - Player to eject mass
     */

    ejectMass(player) {

        if (this.paused) return;
        if (!this.canEject(player)) return;

        var cells = player.cells.toArray();
        var len = cells.length
        for (var i = 0; i < len; i++) {
            var cell = cells[i],
                deltaX = player.mouse.x - cell.position.x,
                deltaY = player.mouse.y - cell.position.y;
            if (!this.ejectCheck(cell)) continue;
            var angle = Math.atan2(deltaY, deltaX)
            angle += (Math.random() * 0.1) - 0.05;
            var size = cell.size + 0.2;
            var startPos = {
                x: cell.position.x + ((size + this.getConfig().ejectedMass) * Math.cos(angle)),
                y: cell.position.y + ((size + this.getConfig().ejectedMass) * Math.sin(angle))
            };



            var ejected = this.addNode(startPos, this.getConfig().ejectedMass, 3, player, [], "m")
            ejected.setEngine1(angle, this.getConfig().ejectedSpeed, this.getConfig().ejectedDecay)
                // ejected.setCurve(10)
        }

    }

    /**
     * Shoots a bullet from a player
     * @param {Player} player - Player to shoot bullet
     */

    shootBullet(player) {
        if (this.paused) return;
        if (player.bulletsleft <= 0) return player.bulletsleft = 0;
        player.bulletsleft--;
        if (player.bulletsleft <= 0) {
            player.golden = false;
            this.setTimeout(function () {
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

    /**
     * Splits a player cell
     * @param {Node} cell - Playercell to split
     * @param {Number} angle - Angle to split
     * @param {Number} speed - Speed to split
     * @param {Number} decay - Time for split movement decay
     * @returns {Node} Split item
     */

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
    loopPlayers(call) {
        this.clients.forEach((player) => {
            call(player)
        })
        this.bots.forEach((player) => {
            call(player)
        })
        this.minions.forEach((player) => {
            call(player)
        })
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
            console.log("yel{[OpenAgar]} Command Error: ".styleMe() + e)
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
            this.gameMode.event('onTick')
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
                    this.foodService.loop();
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

                if (!this.timer.bot) return; // bots update slower

                player.move(this, 1 + shift);

                upt.push(player)
            } else {
                player.move(this, 0 + shift);
                upt.push(player)
            }
        });

        upt.forEach((player) => {
            this.collisionHandler.collidePlayer(player)
        });
        upt.forEach((player) => {
            player.checkGameBorders(this);
        })
        upt.forEach((player) => {

            this.updateHash(player);
        });
        upt.forEach((player) => {

            player.movCode()
        })

        this.timer.bot = !this.timer.bot;
    }

    updateHash(node) {
        if (node.dead) return;

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
        if (!hashnodes.length && !node.owner.isBot && node.owner.visible) {
            hashnodes = node.owner.visible;
        }

        if (!hashnodes.every((check) => {

                if (check == node || check.dead) return true;
                if (!node.canEat(check, this)) return true;
                if (!node.collisionCheckCircle(check)) return true




                // check for collisions

                switch (check.type) {
                case 0: // players
                    if (check.owner == node.owner) {

                        if (node.canMerge && check.canMerge) {
                            check.eat(node, this);
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
                    if (!this.collist[check.type]) return true;
                    check.collide(node, this)
                    break;
                }
                return false;
            })) node.nearby = [];


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

        if (this.paused) return;

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
    addCollisionListener(id) {
        this.collist[id] = true;
    }
    addGenerationLoop(min, id, name, start) {
        this.foodService.addLoop(min, id, name, start);
    }
    addFeedListener(id) {
        this.feedListeners[id] = true;
    }
    addEntityType(id, name, clas) {
        this.entityTypes[id] = clas;
        this.getWorld().addEntity(id, name)
    }
    override(n, j, f) {
        Entities[n].prototype[j] = f;
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
            var a = new this.entityTypes[type](position, mass, type, owner, others)
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

module.exports = Main;
