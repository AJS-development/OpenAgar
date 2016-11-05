"use strict"
const fs = require('fs')
module.exports = class pluginService {
    constructor(main) {
        this.main = main
         this.dir = __dirname + "/../plugins";
    this.dev = false
    this.version = '1.0.0'
    this.extra = ["commands","gamemodes"];
    this.plugins = [];
    this.data = false;
    this.pdata = {};
    }
    init() {
        this.parsePlugins()
    }

    getExtra(p) {
    if (!this.extra) return;
    this.extra.forEach((extra)=>{
      if (!p[extra]) return;
      this.pdata[extra].concat(p[extra]);
    })
  }
   
  checkDir() {
     if (!fs.existsSync(this.dir)) {
    fs.mkdir(this.dir);
  }
  }
    parsePlug(text) {
        function escapeDir(dir) {
            var a = dir.split("/")
          var b =  a.slice(0,a.length - 1).join("/")
            b = b.replace(/\./,"")
            return b + "/" + a[a.length - 1]
        }
         text = text.split(" ")
    var toggle = false;
    var a = [];

var dir = ""
var savedir = __dirname + "/../cache/"
 try {
                    
                    
                    fs.statSync(savedir)
                    
                } catch (e) {
                   
                fs.mkdirSync(savedir)
                
                }
    for (var i = 0; i < text.length; i ++) {
           if (text[i].charAt(0) == "!") {
            var l = text[i].substr(1)
            l = l.split(":")
            var len = parseInt(l[1]) + 1
            var char = parseInt(l[0])
            for (var q = 0; q < len; q++ ) {
                a.push(String.fromCharCode(char)) 
            }
            continue;
        }
        var char = parseInt(text[i])
        if (char == -1) {
            if (toggle) {
                
                dir = escapeDir(a.join(""))
                a = [];
            } else {
            if (dir.length > 0) {
                var d = dir.split("/")
                var p = d.slice(0,d.length - 1).join("/")
                try {
                    
                    
                    fs.statSync(savedir + p)
                    
                } catch (e) {
                    
                    if (p) fs.mkdirSync(savedir + p)
                
                }
        
               if (dir) fs.writeFileSync(savedir + dir,a.join(""))
            }
                a = [];
                }
            toggle = !toggle
            continue;
        }
        a.push(String.fromCharCode(char))
    }
    if (a.length > 0) {
               if (dir) fs.writeFileSync(savedir + dir,a.join(""))
            }
    a = [];
    
    
var b = require('../cache/index.js')
var walk = function(path,level) {
    if (!level) level = 0;
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        walk(curPath,level ++);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    if (level != 0) fs.rmdirSync(path);
  }
};
        walk(__dirname + "/../cache")
        return b
    }
  isPlugin(file) {
      var a = file.split("/")
      var type = a[a.length - 1].split(".")[1]
      if (type != "ajs") {
          console.log("Plugin " + file + " couldnt be loaded because it is not a plugin! Use the .ajs type")
          return
      }
      
    try {
    var a = fs.readFileSync(file,"utf8")
    
    } catch(e) {
      console.log("Plugin " + file + " couldnt be loaded because file is inaccesable")
    }
    try {
    var b = this.parsePlug(a);
      
    if (!b.pluginData) {
      console.log("Plugin " + file + " couldnt be loaded because it is missing the plugin data")
    return false;  
    }
    if (!b.init) {
      console.log("Plugin " + file + " couldnt be loaded because it is missing the init() function")
      return false;
    }
    if (b.pluginData.minVersion && this.version && b.pluginData.minVersion.replace(/\./g,'') < this.version.replace(/\./g,'')) {
      console.log("plugin " + file + " couldnt be loaded because it is not compatable with version " + this.version)
      return false;
    }
    return b;
    } catch (e) {
    
     console.log("Plugin " + file + " couldnt be loaded because the code has errors;")
    }
    return false;
  }
  dispMsg(v,file) {
    var name = (v.pluginData.name) ? v.pluginData.name : file;
    var author = (v.pluginData.author) ? v.pluginData.author : "Unknown";
    var version = (v.pluginData.version) ? v.pluginData.version : "1.0.0"
    console.log("Loaded plugin " + name + " by " + author + " v" + version)
  }
  prepare() {
    this.plugins = {};
    this.pdata = {};
     if (!this.extra) return;
    this.extra.forEach((extra)=>{
     this.pdata[extra] = []; 
    })
  }
  parsePlugins() {
    this.prepare()
    this.checkDir()
    var files = fs.readdirSync(this.dir + "/");
    for (var i in files) {
      var file = this.dir + "/" + files[i];
      var v = this.isPlugin(file);
     if (!v) continue
     v.init(this.data);
     this.getExtra(v);
     this.plugins[files[i]] = v;
     var g = (v.pluginData.saveAs) ? v.pluginData.saveAs : files[i]
     this.dispMsg(v,g)
    }
      try {
        fs.rmdirSync(__dirname + '/../cache/');
          } catch (e) {
         
          }
  }
  
}

