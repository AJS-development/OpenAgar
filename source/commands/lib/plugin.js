"use strict";
var request = require('minirequest')
var fs = require('fs')
function search(a,list) {
    
    var title = [];
    var desc = [];
    var others = []
    list.forEach((item)=>{
      if (item.name) {
        var b = item.name.toLowerCase();
        if (b.indexOf(a.toLowerCase()) != -1) {
          title.push(item)
          return;
        }
      }
      if (item.description) {
        if (item.description.toLowerCase().indexOf(a.toLowerCase()) != -1) {
         desc.push(item) 
        return;
        }
      }
      var b = a.split(" ")
      var f = 0;
      b.every((c)=>{
        if (f > 5) {
          others.push(item)
        return false;
          
        }
        if (item.name && item.name.toLowerCase().indexOf(c.toLowerCase()) != -1) {
          f += 2;
        return true;
        }
        if (item.description && item.description.toLowerCase().indexOf(c.toLowerCase()) != -1) {
         f ++;
         return true;
        }
      })
      
      
    })
    var final = [];
    
    final = final.concat(title);
    final = final.concat(desc);
    final = final.concat(others);
    return final
    
  }

module.exports = function(str,ss,log) {
    var main = ss.selected
    str = str.split(" ")
   var action = str[1]

    switch (action) {
        case "add":
            if (!str[2]) return log("Please specify the plugin name!")
            if (!str[3]) return log("Please specify the plugin url!")
            log("Connecting to " + str[3])
           request(str[3],function(e,r,b) {
               if (!e && r.responseCode == 200 && b) {
                   fs.writeFileSync(__dirname + '/../../plugins/' + str[2] + '.ajs',b)
                   log("Plugin succesfully downloaded. Reloading plugins")
                setTimeout(function() {
                    main.pluginService.reload()
                },1000)   
               } else {
                   return log("That URL was not found!")
               }
               
           })
            break;
        case "install":
            if (!str[2]) return log("Please specify a plugin name!")
            var libraries = fs.readFileSync(__dirname + '/libraries',"utf8")
            libraries = libraries.split('\n')
            var done = false;
           var count = 0;
            var am = 0;
            libraries.forEach((library)=>{
                library = library.replace(/\s/g,"")
                if (!library) return;
                count ++;
                am ++;
                request(library + "?" +  Math.floor(Math.random() * 1000),(e,r,b)=>{
                 
                    if (!e && r.statusCode == 200 && b) {
                       var plugins = JSON.parse(b)
                     plugins.every((plugin)=>{
                         if (done) return false;
                         if (!plugin.name || !plugin.src || str[2] != plugin.name) return true;
                       done = true;
                         log("Found plugin. Downloading...")
                         request(plugin.src + "?" + Math.floor(Math.random() * 1000),(e,r,b)=>{
                                if (!e && r.statusCode == 200 && b) {
                              fs.writeFileSync(__dirname + '/../../plugins/' + plugin.name + '.ajs',b)
                   log("Plugin succesfully downloaded. Reloading plugins")
                setTimeout(function() {
                    main.pluginService.reload()
                },1000)   
                                } else {
                                    log("URL " + plugin.src + " is not accesable!")
                                }
                         }) 
                         return false;
                     })
                    } else {
                        log("Failed to connect to library " + library)
                    }
                       am --;
                    if (am <= 0) {
                        if (!done) log("Plugin " + str[2] + " was not found. Search for plugins using plugin search [keyword]")
                    }
                })
            })
             log("Requesting plugins from " + count + " libraries")
             
            break;
        case "reload":
            log("Reloading plugins...")
              main.pluginService.reload()
            break;
        case "library":
            if (!str[2]) return log("Please specify the library file url")
             var libraries = fs.readFileSync(__dirname + '/libraries',"utf8")
            libraries = libraries.split('\n')
            var out = [];
            libraries.forEach((library)=>{
                library = library.replace(/\s/g,"")
                if (library) out.push(library)
            })
            out.push(str[2])
            fs.writeFileSync(__dirname + '/libraries',out.join("\n"))
            log("Added library " + str[2])
            break;
        case "search":
            var a = str.slice(2).join(" ")
            if (!a) return log("Please enter something to search")
              var libraries = fs.readFileSync(__dirname + '/libraries',"utf8").split("\n")
              var list = [];
              var count = 0;
            var out = [];
             libraries.forEach((library)=>{
                library = library.replace(/\s/g,"")
                if (!library) return;
                count ++;
                request(library + "?" + Math.floor(Math.random() * 1000),(e,r,b)=>{
                    
                    if (!e && r.statusCode == 200 && b) {
                       list = list.concat(JSON.parse(b))
                    } else {
                      
                        log("Couldnt connect to " + library)
                        
                    }
                    count --;
                        if (count <= 0) {
                            var items = search(a,list)
                         
                            if (items.length == 0) return log("No items were found with the search " + a)
                            log("Search results for " + a + " :");
                            items.forEach((item)=>{
                                log("  " + item.name + "\n     Description: "+ item.description);
                                
                            })
                        }
                })
             })
            break;
        default:
            log("Command not found. Available commands: install, add, library, search")
            break;
            
    }
}
