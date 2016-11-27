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
      
        if (main.clients.length == 0) return log("There are no players in the game!")
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
          center.y = Math.round(center.y)
          center.x = Math.round(center.x)
                }
          log("|" + fill(client.id.toString(),5) + "|" + fill(client.socket.remoteAddress,12) + "|" + fill(name,16) + "|" + fill(chatname,18) + "|" + fill(rank.toString(),8) + "|" + fill(center.x.toString(),7) + "|" + fill(center.y.toString(),6) + "|") 
        })
        
    } else if (str[1] == "bots") {
              if (main.bots.length == 0) return log("There are no bots in the game!")
           log("|-------------------------------------Bots-------------------------------------|")
        log("| Id  | BotId | Name           | LBrank |  posX   |  posY   |  Alive  | Mass   |")
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
       alive = Math.round(alive/6000)
       alive = alive / 10
       
                if (client.cells[0]) {
                    center = client.cells[0].position
                      center.y = Math.round(center.y)
          center.x = Math.round(center.x)
                }
          
          log("|" + fill(client.id.toString(),5) + "|" + fill(client.botid.toString(),7) + "|" + fill(name,16) + "|" + fill(rank.toString(),8) + "|" + fill(center.x.toString(),9) + "|" + fill(center.y.toString(),9) + "|" + fill(alive.toString(),9) + "|" + fill(client.mass.toString(),8) + "|") 
        })
    } else if (str[1] == "minions") {
        if (main.minions.length == 0) return log("There are no minions in the game!")
            log("|-----------------------------------Minions------------------------------------|")
        log("| Id  | BotId | Name           | LBrank |  posX   |  posY   | OwnerId | Mass   |")
        main.minions.forEach((client)=>{
        

            var name = client.gameData.name
            var chatname = client.gameData.chatName
            name = name || "An Unamed Cell";
            var rank = client.rank || "NA";
            var center = {
                x: "NA",
                y: "NA"
            }
     
       
                if (client.cells[0]) {
                    center = client.cells[0].position
                       center.y = Math.round(center.y)
          center.x = Math.round(center.x)
                }
          
          log("|" + fill(client.id.toString(),5) + "|" + fill(client.botid.toString(),7) + "|" + fill(name,16) + "|" + fill(rank.toString(),8) + "|" + fill(center.x.toString(),9) + "|" + fill(center.y.toString(),9) + "|" + fill(client.parent.id.toString(),9) + "|" + fill(client.mass.toString(),8) + "|") 
        })
    } else if (str[1] == "help") {
        log("|-------Available Commands for List-------|")
        log("|players | Lists the players in the server|")
        log("|bots    | Lists the bots in the server   |")
        log("|minions | Lists the minions in the server|")
        log("|help    | Displays a list of actions     |")
        log("|-----------------------------------------|")
    } else {
     log("Action not found, please do list help to see a list of actions" ) 
        
    }
    
}
