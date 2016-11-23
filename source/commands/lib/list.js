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
        log("-----------------------------------Players-----------------------------------")
        log("| Id  | Ip        | Name          | ChatName        | rank | posX | posY |")
        main.clients.forEach((client)=>{
        

            var name = client.gameData.name
            var chatname = client.gameData.chatName
            name = name || "An Unamed Cell";
          log("|" + fill(client.id.toString(),5) + "|" + fill(client.socket.remoteAddress,10) + "|" + fill(name,15) + "|" + fill(chatname,17) + "|")  
        })
        
    } else if (str[1] == "bots") {
        
    } else if (str[1] == "minions") {
        
    } else if (str[1] == "help") {
        
    } else {
     log("Command not found, Available commands: players,bots,minions,all"   
        
    }
    
}
