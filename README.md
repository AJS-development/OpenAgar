<p align="center">
  <img src="http://opnagar.us/OpenAgar.png">
</p>

[![Build Status](https://travis-ci.org/AJS-development/OpenAgar.svg?branch=master)](https://travis-ci.org/AJS-development/OpenAgar) [![Forums](https://img.shields.io/badge/Forums-home.opnagar.us-blue.svg)](http://home.opnagar.us) [![chat](https://img.shields.io/badge/Chat-Discord-green.svg)](https://discord.gg/8JPsyDn) ![Status](https://img.shields.io/badge/Status-Basically%20Finished-brightgreen.svg) ![Project](https://img.shields.io/badge/Project-Semi--Private-yellow.svg) [![Plugins](https://img.shields.io/badge/Plugins-OAPlugins-green.svg)](https://github.com/AJS-development/OAPlugins) ![Stats](https://img.shields.io/badge/Code-152747%20Lines-green.svg)

Hello, we are AJS Development! We are the same team that brought you OgarUl! In AJS, we have many members. The main members are Andrews54757 and LegitSoulja. We decided to create this project after OgarUl's Ogar infrastructure couldnt hold with all those cool features! So, we created our own, completely from scratch. Now, OpenAgar is the most efficient Ogar-like game server available! Twice as efficient as MultiOgar, a gazillion times efficient than OgarUL, and 5 times efficient than Ogar! ([Proof](https://github.com/AJS-development/OpenAgar/issues/1)) We also decided to make OpenAgar as interesting as possible! New physics, new features, new gameplay and more!

## What game?
It is a web game that we are making, similar to [agar.io](https://agar.io), but very different

## How to Use

**Please note that a key is required, that it's distribution is limited! This is so that computer newbies wont waste our time**

#### Dependencies
* Nodejs (**v5.10.0**+)
* Npm (included with Nodejs)

#### Guide

1. Download this repo, or do `git clone https://github.com/AJS-development/OpenAgar.git` to download from command line.
2. Change directory to the project folder `cd OpenAgar`
3. Make sure all the dependancies are installed
4. Install npm dependancies `npm install`
5. Run index.js using node `node index.js`
6. Record the ID given and get the appropriate key by going here: http://login.opnagar.us.
7. Paste your key into `key.txt` (command line: `nano key.txt`)
8. Run index.js again
9. Connect using `opnagar.us`

#### Registration
While you do not need to registrate to run openagar (not anymore), you need to registrate to use services provided by AJS. Such include:

1. Statistics - Publishing your server online to opnagar.us
2. Plugins - Use of our libraries (One plugins is allowed for unregistered copies)
3. Socket Protection
4. Skin publishing - globally to opnagar.us
5. Auto issue reports
6. Our client.


If you dont registrate, you are unable to:

1. Publish server on stats
2. Use more than 1 plugin
3. No socket protection
4. Inability to use our client (excluding localhost and lan)
5. Inability to publish global skins
6. Auto issue reports

##### Login.opnagar.us
This is the website to generate keys from. You will have to sign up/sign in using your github account. We are using github because:

1. We would rather have developers, not noobs
2. We dont want to deal with managing accounts (ie, making sure they are real)

Then, once you are logged in, you can register servers. You may only have two registrated servers in your account. You may delete or deactivate unused registrations

#### Please do not misuse the registration system
Please do not be an idiot and try to make money off of ths system. We will monitor accounts and suspend them that are known for misuse.

## NEVER BUY OPENAGAR!
If you bought a copy of openagar, wow, you have been ripped. People who have a registrated version might try to sell it for money. While sharing of servers is allowed, however note that if multiple people are using it at the same time - your server will become unjoinable - I suggest not doing this unless you are his/her friend. Another thing, is that openagar is free. Yes, its FREE. Also, the registration is FREE and UNLIMITED.

## Commands
There are commands you can type in command line.

|Command    | Desc   |
|-----------|--------|
|help       |Displays a list of commands|
|startv     |Start visual gui, not implemented|
|plugin     |Plugin command, the core feature of OpenAgar|
|list       |List the players/bots/minions in the game|
|server     |Create servers, remove servers, select servers, and list them |
|pause      |Pause/unpause the game|
|restart    |Restart. Use just like you would use in command prompt. Do restart all [time] to restart all servers|
|kick       |Kick a player|
|kickbots   |Kick bots|
|addbots    |Add bots|
|ban        |Ban players|
|debug      |Toggle the debug console|
|update     |Updates the software|
|stop       |Stops the server|


## Chat Commands
There are also chat commands

|Command    | Desc   |
|-----------|--------|
|help       |Displays a list of commands|

## Gamemodes
There are also some gamemodes

| ID | Mode       |
|----|------------|
|0   |FFA         |
|1   |Teams       |
|2   |Experimental|
|3   |Minions     |
|4   |Hide n seek |
|5   |Adv Teams   |
|6   |Get rich or die trying (not finished)|
|7   |Leap (not finished)|
|8   |Timed FFA (not finished)|
|9   |Hunger Games (not finished)|

## Minigames
Minigames are planned for OpenAgar, we dont know exactly how they will work, but we have an idea. Some ideas:

* Pool: Like 8-ball pool with some tweaks. (2 players)
* Maze: A maze, with teams and the first team to solve first wins (2-20 players)
* Get the F off my turf: A game where you defend your turf from others.

## Statistics
Statistics allow you to host a public server. To post your server to statistics, edit serverConfig.ini's statistics config values. Then, your server will be listed and it will be joinable at `http://opnagar.us/server/yoururl`. 

## Plugins
Since most of OpenAgar's features doesnt come in the box, plugins are very important. So we made it very easy to install plugins. 

#### The Plugin Command
The plugin command has four important actions.

##### 1. install
> plugin install [name]

Install a plugin from plugin library. The default library is [this](https://github.com/AJS-development/OAPlugins). Note that plugins are case sensitive.

##### 2. search
> plugin search [search term]

Search plugin librarys for plugins matching your search term

##### 3. library
> plugin library [url] 

This adds a library to install/search plugins from. The url is the plugin JSON file with all the plugin data ([example](https://github.com/AJS-development/OAPlugins/blob/master/plugins.json)). All the libraries are stored in `source/commands/lib/libraries`. It is a line-break separated list of urls.

##### 4. add
> plugin add [name] [url]

This adds a plugin from it's url.

## Multi-Server system
OpenAgar is made so you can host multiple servers on one port. There are two ways to create additional servers in the multi-server system

#### The settings/server folder
Using this folder, you can automatically have OpenAgar create additional servers for you. Also, this allows you to easily change the configurations of the individual servers.

##### Usage
1. Create a file in the source/settings/server folder, the file should be `[Server name].ini`
2. Then, you can override configs in that file. For example, I can put the line `gameMode = 1` to have the server be in teams
3. Start the server. Your server will automatically be created.

#### The server command
The server command has 4 different usages

##### 1. create
> server create [name] [configs (optional)]

This adds an additional server. The configs argument overrides default configs and looks like this: `configname1:value1,configname2:value2`. You do not have to specify every config values.

##### 2. remove
> server remove [id]

This removes a server by id

##### 3. select
> server select [id]

This selects a server for you to control via console.

##### 4. list
> server list

This lists all servers: their ids, names, players/bots, uptime, and status

## SSL
OpenAgar is compatable with SSL. To use, set ssl to true in serverConfig.ini. 

#### rsa.json
SSL uses this file to configure SSL.

```
{
   "key": "", // RSA Private key (PEM format)
   "certificate": "", // RSA Signed Certificate
   "ca": "", // certificate authority
   "expire": int // Expiration (in milliseconds) (Optional)
}
```

#### Self-Signed-cert
OpenAgar can generate its own self-signed RSA certificate. To use, just set ssl to true, without adding the rsa.json file. However, to be able to connect however (in most browsers), you must go to `https:yourip:yourport` in the browser and verify the certificate. (Since no CA is used)

## Developers

* Andrews54757
* LegitSoulja

# Support
One thing we decided, was that we are not going to help other people run this project. If you cant... Too bad, use ogar. We are really trying to have this project be semi-private. 

## More like ClosedAgar
People have complained to me about this project being semi private. But in order to have everybody enjoy it, we must, since being too open means disaster. This was the problem with OgarUL, it got too big it collapsed on itself. Resources cost money you know.

## FAQ
#### How can I help?
Make a pr. But please make good ones

#### How come features are so limited?
Actually, there are a lot of features, but none come in the box. You must use the plugin command to add them

#### Can I make a Pull Request?
Yes, but note that we are very very strict. So many pull requests wont be accepted

#### Can I make a fork?
Yes, you may.

#### I want to post a server to stats, however I am worried over ddos attacks and other things
Statistics will not show your ip, minimising ddos attacks. Also, OpenAgar is made to handle them. It will detect those attacks and mitigate them. DDOSers have no life.

#### Why are some files encrypted?
Some files are encrypted because they are needed to secure things such as sockets, or because they use our assets (our servers, other resources...). 
