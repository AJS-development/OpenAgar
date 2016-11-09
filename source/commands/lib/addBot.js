module.exports = function(str,main,log) {
    str = str.split(" ")
   var amount = parseInt(str[1])
   if (isNaN(amount)) return log("Please enter a valid amount")
    main.addBots(amount)
    log( amount + " bots added")
}
