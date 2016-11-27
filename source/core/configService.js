
'use strict';
/*
    OpenAgar - Open source web game
    Copyright (C) 2016 Andrew S
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const fs = require("fs");
const ini = require('../modules/ini.js');


module.exports = {

 loadSConfig: function(d) {
    try {
    var config = ini.parse(fs.readFileSync(__dirname + '/../settings/serverConfig.ini',"utf8"))
    
    return config;
    
} catch (e) {
    if (d) {
        console.log("Error with getting config:")
        throw e
    }
   return false
} 
 },
  loadConfig: function(dir,d) {
try {
    var physics = ini.parse(fs.readFileSync(dir + '/physicsConfig.ini',"utf8"))
    var config = ini.parse(fs.readFileSync(dir + '/config.ini',"utf8"))
     var client = ini.parse(fs.readFileSync(dir + '/clientConfig.ini',"utf8"))
    for (var i in physics) {
        if (!config[i]) config[i] = physics[i]
    }
    for (var i in client) {
        if (!config[i]) config[i] = client[i]
    }
    return config;
    
} catch (e) {
    if (d) {
        console.log("Error with getting config:")
        throw e
    }
   return false
}
      

    },


  
};
