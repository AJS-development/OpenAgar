module.exports = function(str,ss,log) {
  
   str = str.split(" ")
  
  if (str[1] == "all") {
    var time = parseInt(str[2])
  if (str[2] == "now" || time == 0) {
    
        
    ss.restartAll()
    ss.controller.shellService.drawSplash()
        log("gre{[OpenAgar]} Restarted all servers".styleMe())
    return;
  }
    if (isNaN(time)) return log("Please specify time, in minutes, or type 'restart now' to restart now")
    setTimeout(function() {
        console.log('\033[2J');
        
    ss.restartAll()
    ss.controller.shellService.drawSplash()
    log("gre{[OpenAgar]} Restarted all servers".styleMe())
    },60000 * time)
  
  } else {
       var time = parseInt(str[1])
  if (str[1] == "now" || time == 0) {
     process.stdout.write("\u001b[2J\u001b[0;0H");
    ss.restartSelected()
        log("gre{[OpenAgar]} Restarted selected server".styleMe())
    return;
  }
    if (isNaN(time)) return log("Please specify time, in minutes, or type 'restart now' to restart now")
    setTimeout(function() {
 process.stdout.write("\u001b[2J\u001b[0;0H");
    ss.restartSelected()
    log("gre{[OpenAgar]} Restarted selected server".styleMe())
    },60000 * time)
    
    
  }
  
}
