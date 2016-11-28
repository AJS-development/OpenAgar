module.exports = function(str,ss,log) {
  
   str = str.split(" ")
  
  if (str[1] == "all") {
    var time = parseInt(str[2])
  if (str[2] == "now" || time == 0) {
    ss.restartAll()
  }
    if (isNaN(time)) return log("Please specify time, in minutes, or type 'restart now' to restart now")
    setTimeout(function() {
    ss.restartAll()
    },60000 * time)
  
  } else {
       var time = parseInt(str[2])
  if (str[2] == "now" || time == 0) {
    ss.restartSelected()
  }
    if (isNaN(time)) return log("Please specify time, in minutes, or type 'restart now' to restart now")
    setTimeout(function() {
    ss.restartSelected()
    },60000 * time)
    
    
  }
  
}
