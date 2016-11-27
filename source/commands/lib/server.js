module.exports = function (str,ss, log) {
  var split = str.split(" ")
  
 if (split[1] == "list") {
 log("Listing servers...")
  var servers = ss.servers
   log("|------------------------------------Servers-----------------------------------|")
   log("| Id  | Name          | ScreenName     | Players | Bots | Uptime | Status      |")
    var fill = function(a,num,char) {
        char = char || " "
        num -= a.length
        for (var i = 0; i < num; i ++) {
            a += char
        }
        return a
    }
     var time = Date.now()
  servers.forEach(function(server) {
      var upt = time - server.timer.init
      upt = (upt/6000) >> 0
       upt = upt / 10
       var status = "";
     
      if (server.selected && server.isMain) {
          status = "[Selected][M]";
      } else if (server.selected) {
          status = "[Selected]"
      } else if (server.isMain) {
          status = "[Main]"
      }
  
   log("|" + fill(server.id.toString(),5) + "|" + fill(server.name,15) + "|" + fill(server.scname,16) + "|" + fill(server.clients.length.toString(),9) + "|" + fill(server.bots.length.toString(),6) + "|" + fill(upt.toString(),8) + "|" + fill(status,13) + "|")
  });
   
 } else if (split[1] == "create") {
  var name = split[2]
  var sc = split.slice(3).join(" ")
if (!name || !sc) {

return log("Please provide a name and a screen name")
}
     if (ss.createServer(name,sc,ss.defconfig,false)) log("Server succesfully created"); else return log("Could not create server")
     
     ss.reloadInfoP()
     
 } else if (split[1] == "remove") {
  var id = parseInt(split[2])
  if (isNaN(id)) return log("Please specify a server id!")
  
  if (ss.removeServer(id)) log("Removed server"); else return log("Failed to remove server. Check to make sure it is not main or is not selected.")
    ss.reloadInfoP()
 } else if (split[1] == "select") {
   if (!split[2]) {
     log("[Console] Please specify a server ids");
     return;
   }
    if (ss.select(parseInt(split[2]),function() {
        log("Successfully switched servers")
    
    })) console.log("Switching servers..."); else
log("That server doesnt exist!");
 } else {
  log("Please specify a command! (list, select,remove,create)");
 }
  
  
}