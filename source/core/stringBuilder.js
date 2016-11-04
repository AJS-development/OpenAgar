"use strict";
// No license here. Link: https://github.com/AJS-development/SimpleStringBuilder/blob/master/index.js
module.exports = class SB {
constructor(string) {
this.t = [];
this.t.push(string)
}
append(/**/) {
if (!arguments) return false;
arguments.forEach((str)=>{
this.t.push(str)
})
return true;
}
toString() {
return this.t.join("")
}
}
