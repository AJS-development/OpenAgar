"use strict"
var request = require('minirequest')
var fs = require('fs')
var exec = require('child_process').exec
module.exports = class Updater {
    constructor(ss) {
        this.ss = ss;
        this.dir = 'https://raw.githubusercontent.com/AJS-development/OpenAgar'
    }
    updateDone() {
        console.log("done. Installing modules..")
        this.install(function(e) {
            if (e) console.log("ERROR: " + e); else console.log("Done")
        })
        
    }
    install(call) {
         var child = exec("npm install", function (error, stdout, stderr) {
    call(error)
    });
    }
    update() {
        console.log("updating...")
        request('https://raw.githubusercontent.com/AJS-development/OpAgMS/master/files.json',function(e,r,b) {
            try{
                    if (!e && r.statusCode == 200) {
                     var data = JSON.parse(b)
                     this.count = 0;
                        data.forEach((dt)=>{
                            if (!dt) return;
                            this.count ++;
                            console.log("Downloading " + dt.name)
                            this.downloadFile(dt,function(e) {
                                if (e) throw e
                                
                                this.count --;
                                if (this.count <= 0) {
                                    this.updateDone()
                                    
                                }
                            }.bind(this))
                        })
                        
                    }
            } catch (e) {
                console.log("ERROR:" + e)
            }
        }.bind(this))
    }
    writeFileSafe(dir,file,data,call) {
  file = file.split("/")
  if (!file[0]) {
      file = file.slice(1)
  }
  try {
      fs.lstatSync(dir + "/" + file.join("/"))
  } catch (e) {
  var test = dir
  for (var i = 0; i < file.length - 1; i ++) {
      var a = file[i]
      test += "/" + a
      try {
          
          fs.lstatSync(test)
      } catch(e) {
      
          fs.mkdir(test)
      }
  }
  }
         fs.writeFile(dir + "/" + file.join("/"),data,function() {call()})
  
    }
    downloadFile(data,call) {
        var src = data.src
        var url = this.dir + data.url
        request(data.url,function(e,r,b) {
            if (!e && r.statusCode == 200) {
                
                this.writeFileSafe(__dirname + "/../../",data.src,b,call)
             
                
            } else {
                call("Could not locate " + data.url)
            }
            
        }.bind(this)) 
            
        
        
    }
    
    
}