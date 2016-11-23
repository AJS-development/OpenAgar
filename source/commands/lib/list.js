"use strict"
module.exports = function(str,main,log) {
    var fill = function(a,num,char) {
        char = char || " "
        num -= a.length
        for (var i = 0; i < num; i ++) {
            a += char
        }
        return a
    }
    str = str.split(" ")
    if (str[1] == "players") {
        // 50
        log("|------------------------------------Players-----------------------------------|")
        log("| Id  | Ip         | Name           | ChatName         | LBrank | posX  | posY |")
        main.clients.forEach((client)=>{
        

            var name = client.gameData.name
            var chatname = client.gameData.chatName
            name = name || "An Unamed Cell";
            var rank = client.rank || "NA";
            var center = {
                x: "NA",
                y: "NA"
            }
       
                if (client.center.x) {
                    center = client.center
          center.y = ~~center.y 
          center.x = ~~center.x 
                }
          log("|" + fill(client.id.toString(),5) + "|" + fill(client.socket.remoteAddress,12) + "|" + fill(name,16) + "|" + fill(chatname,18) + "|" + fill(rank.toString(),8) + "|" + fill(center.x.toString(),7) + "|" + fill(center.y.toString(),6) + "|") 
        })
        
    } else if (str[1] == "bots") {
           log("|-------------------------------------Bots-------------------------------------|")
        log("| Id  | BotId | Name           | LBrank |  posX  |  posY  | Alive  | Mass   |")
        main.bots.forEach((client)=>{
        

            var name = client.gameData.name
            var chatname = client.gameData.chatName
            name = name || "An Unamed Cell";
            var rank = client.rank || "NA";
            var center = {
                x: "NA",
                y: "NA"
            }
       var alive = main.timer.time - client.alive
       alive = ~~(alive/6000)
       alive *= 0.1
       
                if (client.cells[0]) {
                    center = client.cells[0].position
                    center.y = ~~center.y 
          center.x = ~~center.x    
                }
          
          log("|" + fill(client.id.toString(),5) + "|" + fill(client.botid.toString(),7) + "|" + fill(name,16) + "|" + fill(rank.toString(),8) + "|" + fill(center.x.toString(),9) + "|" + fill(center.y.toString(),9) + "|" + fill(alive.toString(),8) + "|" + fill(client.mass.toString(),7)) 
        })
    } else if (str[1] == "minions") {
        
    } else if (str[1] == "help") {
        
    } else {
     log("Command not found, Available commands: players,bots,minions,all" ) 
        
    }
    
}
