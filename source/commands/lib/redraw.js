module.exports = function(str,ss,log) {
    log("gre{[OpenAgar]} Redrawing...".styleMe())
    ss.controller.shellService.writeLog(function() {
        log("gre{[OpenAgar]} Done".styleMe())
    })
    
}