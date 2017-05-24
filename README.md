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
9. Connect using `opnagar.us` (development client, real one will be at ogarul.io)

#### The key system
In order to use this, you must have a key. This is so this project isnt overwhelmed with people. However, you can get your key from us via http://login.opnagar.us. We will never charge or demand anything for it. However, we are limiting the amount of keys given out, to maintain this projects semi-private status.

##### Login.opnagar.us
This is the website to generate keys from. You will have to sign up/sign in using your github account. Note there is a limit to the amount of accounts. We are using github because:

1. We would rather have developers, not noobs
2. We dont want to deal with managing accounts (ie, making sure they are real)

Then, once you are logged in, you can generate keys. You may only have one active key in your account. If you need to replace your key, for some reasons, you can deactivate your old one and activate the new key.

#### Please do not misuse the key system
Please do not be an idiot and try to make money off of ths system. We will monitor accounts and suspend them that are known for misuse.

## NEVER BUY OPENAGAR!
If you bought a copy of openagar, wow, you have been ripped. People who have a key might trick you that they will give away their copy for money. First off, that is impossible as keys are **generated uniquely for every machine**. This means the key they have, wont work on your machine, even if you copied their entire computer. Secondly, who would actually 'give up' a rare copy of OpenAgar? They would rather just trick you. Thirdly, even if they did give it to you, and you managed to use their key (which is impossible), they would be able to remotly disable your purchased key and generate another one for themselves. So my advice to you: If you really want a copy, yet you dont have one, too bad, deal with it.

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

## Added Mechanics:

##### 1. Bullets
Press f to shoot a bullet. A small, slow, grey object that moves to your destination. Changes direction when ejected mass is shot at it. You can only have 3. Then if you are below 1000 in mass, it will reload the bullets in 25 seconds. But know that if you are above that amount, and 25 seconds pass, then you will lose bullets forever until you die. If you consume your own or are below 500, then it is consumed and you get another bullet to spend (horaay!). If not, then you explode, like a virus, but much severly. There are much more to bullets. But you have to discover them. Have fun!


##### 2. Golden Bullets
There is a very slight chance that when they are reloaded, you get golden bullets instead. Behaves just like normal bullets, except the target literally explodes (slither.io?). You will not be notified when this happens. So let the mystery begin!

##### 3. Wormholes
They are black thingys that you can teleport with. If you collide with one, and you are below the mass of the wormhole, you will be teleported to another wormhole. If you have more than one cell, then the other cells will be lost. If you are bigger, there is a chance that you will teleport (with the one cell rule) while breaking the wormholes, or you may not teleport at all. But if you do or do not, your cell's mass will become the size of the wormhole plus a little more (A strategy might be find the biggest wormhole, become as big as the wormhole, collide, if no tp, then stay, so anyone who tped there will be eaten). 

> Note that you have to set minWormHoles to a number as they are disabled by default


## Developers

* Andrews54757
* LegitSoulja

# Support
One thing we decided, was that we are not going to help other people run this project. If you cant... Too bad, use ogar. We are really trying to have this project be semi-private. 


## More like ClosedAgar
People have complained to me about this project being semi private. But in order to have everybody enjoy it, we must, since being too open means disaster. This was the problem with OgarUL, it got too big it collapsed on itself.

## FAQ
#### Will this project ever be fully opened to the public?
No, we want to keep it semi-private. No more than 100 users

#### How can I help?
You cant

#### How come features are so limited?
Actually, there are a lot of features, but none come in the box. You must use the plugin command to add them

#### Can I make a Pull Request?
Yes, but note that we are very very strict. So many pull requests wont be accepted

#### Can I make a fork?
Yes, you may.

#### The account limit is reached! And I want to use this very badly
There are exceptions, meaning there is still ways to use with the limit reached. In order to qualify, you must either: 

1. Contribute to the __code__, and have changes accepted or
2. Create 3 plugins or
3. Host a server for OpenAgar Stats (And who does this will get an extra key to register)

#### I want to post a server to stats, however I am worried over ddos attacks and other things
Statistics will not show your ip, minimising ddos attacks. Also, OpenAgar is made to handle them. It will detect those attacks and mitigate them.

#### Why are some files encrypted?
Some files are encrypted because they are needed to secure things such as sockets, or because they use our assets (our servers, other resources...). 

## Another Note
This game is different and is not Agar.io or Ogar. It is similar, but very different. We are making a unique game.

