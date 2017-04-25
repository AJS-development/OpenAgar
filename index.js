var main = require('./source/core/controller.js')
    //require('./cpu.js').init('./data')
    //require('./heap.js').init('./data')


Map.prototype.every = function (c) {
    var a = this.entries()
    var b;
    while (b = a.next().value) {
        if (!c(b[1], b[0])) return false;
    }

    return true;
}
Map.prototype.toArray = function () {
    var array = [];
    this.forEach(function (a) {
        array.push(a)
    })
    return array
}

Map.prototype.map = function (c) {
    var f = new Map();
    var a = this.entries()
    var b;
    while (b = a.next().value) {
        f.set(b[0], c(b[1], b[0]))
    }
    return f;

}
Map.prototype.filter = function (c) {
    var f = new Map();
    var a = this.entries()
    var b;
    while (b = a.next().value) {
        if (c(b[1], b[0])) f.set(b[0], b[1])
    }
    return f;

}
Map.prototype.peek = function () {
    var a = this.entries();
    var b = a.next().value;
    return (b) ? b[1] : false;
}

var fs = require('fs')

var toCheck = JSON.parse(fs.readFileSync(__dirname + "/install.json", "utf8"))
var exec = require('child_process').exec;
var modules = []
console.log("Checking Modules")
try {
    var f = JSON.parse(fs.readFileSync("modules.json", "utf8"));
    var u = 0,
        a = 0
    for (var i = 0; i < toCheck.length; i++) {
        var m = toCheck[i],
            b = f[i];

        if (!b) {;
            a++;
            modules.push(b)
        } else if (m.version != b.version) {;
            u++;
            modules.push(b)
        }
    }
    console.log(a + " Modules need to be installed; " + u + " modules need to be updated")
} catch (e) {
    modules = toCheck;
    console.log(toCheck.length + " Modules need to be installed")
}
if (!modules.length) return callback();
console.log("Installing Module(s)")
var todo = 1;
var done = 0;

function loading(ne) {
    done++;
    var percent = Math.round(done / todo * 10)
    var bar = ""
    for (var i = 0; i < percent; i++) {
        bar = bar + "===";
    }
    if (percent == 10) bar = bar + "=";
    else bar = bar + ">";
    var extras = 31 - bar.length;
    var extra = "";
    for (var i = 0; i < extras; i++) extra = extra + " ";
    process.stdout.write("\u001B[?25l\r\x1b[K[npm] [" + bar + extra + "] " + percent * 10 + "% " + ne);
}
var index = 0;
todo += modules.length * 2;
install()

function install() {
    var b = modules[index]
    if (!b) {
        loading("Done!");
        process.stdout.write("\n\u001B[?25h")
        return callback()
    }
    setTimeout(function () {
        loading("Installing " + b.name);
    }, 500)
    exec("npm install " + b.name + "@" + b.version, function (error, stdout, stderr) {
        if (error) {
            console.log("Error with installing module: " + b.name + "\n" + error + "\n");
        }
        loading("Installed " + b.name);
        index++;
        install();
    });
}

function callback() {
    fs.writeFileSync("modules.json", JSON.stringify(toCheck), "utf8")
var m = new main()
m.start()
}
