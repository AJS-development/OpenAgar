module.exports = function(str,main,log) {
main.pause()
if (main.paused) {
log("gre{[OpenAgar]} Paused the game".styleMe())
} else {
log("gre{[OpenAgar]} Unpaused the game".styleMe())
}

}
