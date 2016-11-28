module.exports = function(str,main,log) {
    str = str.split(" ")
   var amount = parseInt(str[1])
   
   if (isNaN(amount)) amount = 1
    main.addBots(amount)
    log("gre{[OpenAgar]} ".styleMe() + amount + " bots added")
}
