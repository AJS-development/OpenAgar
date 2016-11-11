"use strict"
var pluginParser = require('./pluginParser.js')
module.exports = class PluginService {
    constructor(main) {
        this.vars = ["configs","commands"]
        this.main = main
        this.plugins = {};
        this.pdata = {}
        
        this.data = {
            main: main,
            log: main.log
            
        }
        this.parser = new pluginParser(function(a) {main.log("\x1b[32m[PluginService]\x1b[0m " + a)}.bind(this),__dirname + "/../plugins",this.vars,this.data,_version,false)
    
 
    } 
    
    init() {
        this.parser.init()  
        this.plugins = this.parser.getPlugins()
        this.pdata = this.parser.getData()
    }
    getData(data) {
        if (data) {
            return this.pdata[data]
        } else {
            return this.pdata
        }
    }
    send(event,data) {
        if (!data.log) data.log = this.main.log;
        if (!data.main) data.main = this.main;
        if (!data.pluginService) data.pluginService = this;
     for (var i in this.plugins) {
         var plugin = this.plugins[i]
            if (plugin && plugin[event]) {
               if (!plugin[event](data)) return false;
            }
            continue;
        }
        return true;
    }
    getPlugins() {
        return this.plugins
    }
    
    getData() {
        return this.pdata
    }
    
    
}