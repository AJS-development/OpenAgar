module.exports = function (str, ss, log) {
    var split = str.split(" ")
    if (split[1] == "record") {

        require('fs').writeFileSync(__dirname + '/../../../ban.txt', ss.globalData.ban.join("\n"))
        log("gre{[OpenAgar]} Succesfully recorded ban".styleMe())

        return;

    }
    var id = parseInt(split[1])
    if (isNaN(id)) {

        return log("cya{[OpenAgar]} Please specify a player id!".styleMe())
    }
    var player = ss.getPlayer(id)
    if (!player) return log("cya{[OpenAgar]} That player wasnt found!".styleMe())
    if (player.isBot) return log("cya{[OpenAgar]} That player is a bot!".styleMe())
    var ip = player.socket.remoteAddress
    ss.globalData.ban.push(ip)
    var count = 0;
    ss.clients.forEach((client) => {
        if (client._remoteAddress == ip) {
            count++;
            client._player.kick("You have been banned!")
        }

    })

    log("gre{[OpenAgar]} Banned ".styleMe() + count + " players with an ip of " + player.socket.remoteAddress)

}
