module.exports = function(str,ss,log) {
    if (ss._dwe) ss.updater.update(); else {
     ss._dwe = true;
        setTimeout(function() {
            ss._dwe = false;
        },5000)
        log("Are you sure you want to update? Enter command again to proceed.")   
        
        
    }
    
    
}
