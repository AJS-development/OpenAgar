module.exports = function (str, ss, log) {
    var split = str.split(" ")

    if (split[1] == "list") {
        log("gre{[OpenAgar]} Listing servers...".styleMe())
        var servers = ss.servers
        log("|------------------------------------Servers-----------------------------------|")
        log("| Id  | Name          | ScreenName     | Players | Bots | Uptime | Status      |")
        var fill = function (a, num, char) {
            char = char || " "
            num -= a.length
            for (var i = 0; i < num; i++) {
                a += char
            }
            return a
        }

        var time = Date.now()
        servers.forEach(function (server) {
            var upt = time - server.timer.init
            upt = (upt / 6000) >> 0
            upt = upt / 10
            var status = "";

            if (server.selected && server.isMain) {
                status = "[Selected][M]";
            } else if (server.selected) {
                status = "[Selected]"
            } else if (server.isMain) {
                status = "[Main]"
            }

            log("|" + fill(server.id.toString(), 5) + "|" + fill(server.name, 15) + "|" + fill(server.scname, 16) + "|" + fill(server.clients.size.toString(), 9) + "|" + fill(server.bots.size.toString(), 6) + "|" + fill(upt.toString(), 8) + "|" + fill(status, 13) + "|")
        });

    } else if (split[1] == "create") {
        var name = split[2]

        if (!name) {

            return log("cya{[OpenAgar]} Please provide a name!".styleMe())
        }
        var configOv = Util.argsParser(str, 3);

        var config = {};
        for (var i in ss.defconfig) {
            config[i] = ss.defconfig[i];
        }
        for (var i in configOv) {
            config[i] = configOv[i];
        }
        if (ss.createServer(name, name, config, false)) log("gre{[OpenAgar]} Server succesfully created".styleMe());
        else return log("yel{[OpenAgar]} Could not create server".styleMe())

        ss.reloadInfoP()

    } else if (split[1] == "remove") {
        var id = parseInt(split[2])
        if (isNaN(id)) return log("cya{[OpenAgar]} Please specify a server id!".styleMe())

        if (ss.removeServer(id)) log("gre{[OpenAgar]} Removed server".styleMe());
        else return log("yel{[OpenAgar]} Failed to remove server. Check to make sure it is not main or is not selected.".styleMe())
        ss.reloadInfoP()
    } else if (split[1] == "select") {
        if (!split[2]) {
            log("cya{[OpenAgar]}  Please specify a server ids".styleMe());
            return;
        }
        if (ss.select(parseInt(split[2]), function () {
                log("gre{[OpenAgar]} Successfully switched servers".styleMe())

            })) console.log("gre{[OpenAgar]} Switching servers...".styleMe());
        else
            log("yel{[OpenAgar]} That server doesnt exist or is already selected!".styleMe());
    } else {
        log("cya{[OpenAgar]} Please specify a command! (list, select,remove,create)".styleMe());
    }


}