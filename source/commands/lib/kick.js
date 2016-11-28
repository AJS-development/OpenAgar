module.exports = function(str,main,log) {
  var id = parseInt(str.split(" ")[1])
  if (isNaN(id)){
      
      return log("cya{[OpenAgar]} Please specify a player id!".styleMe())
  }
  var player = main.getPlayer(id)
  if (!player) return log("cya{[OpenAgar]} That player wasnt found!".styleMe())
  
  player.kick()
  log("gre{[OpenAgar]} Succesfully kicked ".styleMe() + player.gameData.name)
  
}
