var Manager = require('./manager.js')
var manager = new Manager()
process.on('message',function(msg) {
    msg = JSON.parse(msg.toString())
 
    switch (msg.type) {
        case 0: // init
            manager.init(msg)
            break;
        case 1: // addnodes
             manager.addNodes(msg.nodes)
            break;
        case 2: // deletenodes
            manager.removeNodes(msg.nodes)
            break;
        case 3: // movecode
            manager.moveCode(msg.nodes)
            break;
        case 4: // assign
            manager.assign(msg.nodes)
            break;
        case 5:
            manager.addBot(msg.id,msg.bot)
            break;
        case 6: // stop
            manager.stop(msg)
            break;
        case 7: // event
            manager.event(msg)
            break;
            
    }
    
    
})
