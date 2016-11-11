module.exports = {

        list: {
         addbot: require('./lib/addBot.js'),
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
            create: function(serverService,str) {
                serverService.create();
            },
            startv: require('./lib/startv.js'),
            stop: require('./lib/stop.js'),
            redraw: require('./lib/redraw.js')
            
        }
    
    
};
