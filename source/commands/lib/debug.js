module.exports = function(str,ss,log) {
    if (ss._DEBUG) {
        ss._DEBUG = false;
        
        ss.controller.shellService.select(ss.selected.id)
        console.log("Gettting off the debug console...")
    } else {
        ss._DEBUG = true;
       
         ss.controller.shellService.select(0)
          console.log("Debug console loading...")
    }
    
}