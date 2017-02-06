// No license here!

module.exports = {
argsParser: function(str,splitpoint) { // commandname first:hello,secound:just,third:testing --> Object{first:"hello",secound:"just",third:"testing"  }
        var cmd = str.split(" ");
        if (!splitpoint) splitpoint = 1;
        var args = cmd.slice(splitpoint,cmd.length).join(" ").split(",");
        var results = [];
        for (var i in args) {
            var arg = args[i];
            var a = arg.split(":");
            results[a[0]] = a[1];
        }
        return results; 
    },
dirEscape: function(before,dir,ext) {

     dir = dir.split('/')
    var file = dir[dir.length-1]
    var ex = file.split(".")[1]
    if (ext && ex != ext ) return false;
    var f = dir.slice(0,dir.length-1)
    f = f.join("/")
    if (f) f = f.replace(/\./g,"")
   return before + f + "/" + file
},
      getRandomColor: function() {
        var colorRGB = [0xFF, 0x07, (Math.random() * 256) >> 0];
        colorRGB.sort(function () {
            return 0.5 - Math.random();
        });

        return {
            r: colorRGB[0],
            b: colorRGB[1],
            g: colorRGB[2]
        };
    }
}
