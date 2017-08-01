module.exports = {

    list: {
        addbot: require('./lib/addBot.js'),
        kick: require('./lib/kick.js'),
        pause: require('./lib/pause.js'),
        kickbots: require('./lib/kickbots.js'),
        list: require('./lib/list.js'),
        help: function (str, main, log) {
            log("|-----------------Available Commands------------------|")
            log("| Help                     | Shows help for commands  |")
            log("| Stop                     | Stops the server         |")
            log("| List                     | List players, bots, etc  |")
            log("| Plugin                   | Plugin command           |")
            log("| Kick                     | Kick a player            |")
            log("| Ban                      | Ban a player             |")
            log("| Server                   | Multi-Server command     |")
            log("| Pause                    | Pause the game           |")
            log("| Addbot                   | Add bots                 |")
            log("| Debug                    | Toggle debug console     |")
            log("| Update                   | Update software          |")
            log("| Restart                  | Schedule restarts        |")
            log("| Kickbots                 | Kick bots                |");

            if (_lvl() == 1) {
                log("| Mod                      | OpenAgar Sys Moderation  |");
            }
            main.pluginService.addToHelp.forEach((cmd) => {
                log(cmd)
            })
            log("|-----------------------------------------------------|")

        }
    },
    serverService: {
        server: require('./lib/server.js'),
        startv: require('./lib/startv.js'),
        stop: require('./lib/stop.js'),
        ban: require('./lib/ban.js'),
        redraw: require('./lib/redraw.js'),
        plugin: require('./lib/plugin.js'),
        update: require('./lib/update.js'),
        restart: require('./lib/restart.js'),
        debug: require('./lib/debug.js'),
        mod: function (a, b, c) {
            _mod(a, b, c)
        }
    },
    chat: {
        help: function (str, main, player, log) {
            log("================= Commands =================")
            log("Help               | Shows help for commands")
            main.pluginService.chatA.forEach((cmd) => {
                log(cmd)
            })
            log("============================================")

        }

    }


};
