module.exports = {

        list: {
         addbot: require('./lib/addBot.js'),
        kick: require('./lib/kick.js'),
        ban: require('./lib/ban.js'),
        pause: require('./lib/pause.js'),
        list: require('./lib/list.js'),
            help: function(str,main,log) {
            log("|-----------------Available Commands------------------|")
            log("| Help                     | Shows help for commands  |")
            log("| Stop                     | Stops the server         |")
            main.pluginService.addToHelp.forEach((cmd)=>{log(cmd)})
            log("|-----------------------------------------------------|")
                
            }
        },
        serverService: {
            server: require('./lib/server.js'),
            startv: require('./lib/startv.js'),
            stop: require('./lib/stop.js'),
            redraw: require('./lib/redraw.js'),
            plugin: require('./lib/plugin.js'),
            update: require('./lib/update.js'),
            restart: require('./lib/restart.js')
        },
    chat: {
        help: function(str,main,player,log) {
            log("================= Commands =================")
            log("Help               | Shows help for commands")
            main.pluginService.chatA.forEach((cmd)=>{log(cmd)})
            log("============================================")
               
        }
        
    }
    
    
};
