module.exports = function(str,ss,log) {
    log("Redrawing...")
    ss.controller.shellService.writeLog(function() {
        log("Done")
    })
    
}