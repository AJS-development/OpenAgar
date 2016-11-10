module.exports = {

        list: {
         addbot: require('./lib/addBot.js'),
        list: require('./lib/list.js')
        },
        serverService: {
            create: function(serverService,str) {
                serverService.create();
            },
            startv: require('./lib/startv.js'),
            stop: require('./lib/stop.js'),
            help: function(str,ss,log) {
            log("|-----------------Available Commands------------------|")
            log("| Help                     | Shows help for commands  |")
            log("| Stop                     | Stops the server         |")
            log("|-----------------------------------------------------|")
                
            }
        }
    
    
};
