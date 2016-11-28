"use strict"
var request = require('minirequest')
var fs = require('fs')
var exec = require('child_process').exec
module.exports = class Updater {
    constructor(ss) {
        this.ss = ss;
        this.dir = 'https://raw.githubusercontent.com/AJS-development/OpenAgar/master'
      this.tobe = 0;
    this.dow = 0;
    }
    updateDone() {
       this.loading("done. Installing modules..")
        this.install(function(e) {
            if (e) throw e; else this.loading("done. Installing modules..")
        }.bind(this))
        
    }
    install(call) {
         var child = exec("npm install", function (error, stdout, stderr) {
    call(error)
    });
    }
    update() {
        this.dow = 0;
        this.tobe = 2;
        console.log("gre{[Update]} Updating...".styleMe())
        request('https://raw.githubusercontent.com/AJS-development/OpAgMS/master/files.json',function(e,r,b) {
            try{
                    if (!e && r.statusCode == 200) {
                     var data = JSON.parse(b)
                     this.count = 0;
                        data.forEach((dt)=>{
                            if (!dt) return;
                            this.count ++;
                            this.tobe ++;
                          
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
           throw e
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
    loading(action) {
    this.dow ++;
    var percent = Math.round(this.dow/this.tobe*10)
    var bar = ""
    for(var i = 0; i < percent; i++) {
      bar = bar + "===";
    }
    if (percent == 10) bar = bar + "="; else bar = bar + ">";
    var extras = 31 - bar.length;
    var extra = "";
    for (var i = 0; i < extras; i++) extra = extra + " ";
    process.stdout.write("gre{[Update]} [".styleMe() + bar + extra + "] " +  percent*10 + "% " + action + "\r");
    
    
  
    }
    downloadFile(data,call) {
        var src = data.src
        var url = this.dir + data.url

        
        request(url,function(e,r,b) {
            if (!e && r.statusCode == 200 && b) {
                  this.loading("Downloading");
                this.writeFileSafe(__dirname + "/../../",src,b,call)
             
                
            } else {
         
                call("Could not locate " + this.dir + data.url)
            }
            
        }.bind(this)) 
            
        
        
    }
    
    
}
