module.exports = function(str,main,log) {
  str = str.split(" ");
  var count = parseInt(str[1])
  if (isNaN(count)) count = -1;
  var kicked = 0;
  main.bots.every(function(bot) {
    main.removeBot(bot)
    kicked ++;
    if (kicked >= count && count > 0) return false;
    return true;
  })
  log("gre{[OpenAgar]} Kicked ".styleMe() + kicked + " bots")
}
