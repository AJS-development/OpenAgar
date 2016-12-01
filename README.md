[![Build Status](https://travis-ci.org/AJS-development/OpenAgar.svg?branch=master)](https://travis-ci.org/AJS-development/OpenAgar) [![Forums](https://img.shields.io/badge/Forums-Ogarul.io-blue.svg)](http://forum.ogarul.io) [![chat](https://img.shields.io/badge/Chat-Discord-green.svg)](https://discord.gg/8JPsyDn) ![Status](https://img.shields.io/badge/Status-Basically%20Finished-brightgreen.svg) ![Project](https://img.shields.io/badge/Project-Semi--Private-yellow.svg) [![Plugins](https://img.shields.io/badge/Plugins-OAPlugins-green.svg)](https://github.com/AJS-development/OAPlugins)
# OpenAgar

Hello, we are AJS Development! We are the same team that brought you OgarUl! In AJS, we have many members. The main members are Andrews54757 and LegitSoulja. We decided to create this project after OgarUl's Ogar infrastructure couldnt hold with all those cool features! So, we created our own, completely from scratch. Now, OpenAgar is the most efficient Ogar-like game server available! Twice as efficient as MultiOgar, a gazillion times efficient than OgarUL, and 5 times efficient than Ogar! ([Proof](https://github.com/AJS-development/OpenAgar/issues/1)) We also decided to make OpenAgar as interesting as possible! New physics, new features, new gameplay and more!

## What game?
It is a web game that we are making, similar to [agar.io](https://agar.io), but very different

## How to Use

**Please note that a key is required, that it's distribution is limited! This is so that computer newbies wont waste our time**

#### Dependancies
* Nodejs
* Npm (included with Nodejs)

#### Guide

1. Download this repo, or do `git clone https://github.com/AJS-development/OpenAgar.git` to download from command line.
2. Change directory to the project folder `cd OpenAgar`
3. Make sure all the dependancies are installed
4. Install npm dependancies `npm install`
5. Run index.js using node `node index.js`
6. Record the ID given and get the appropriete key from staff.
7. Paste your key into `key.txt` (command line: `nano key.txt`)
8. Run index.js again
9. Connect using `play.ogarul.io/new` (development client, real one will be at ogarul.io)

#### The key system
In order to use this, you must have a key. This is so this project isnt overwhelmed with people. However, you can get your key from us. We will never charge or demand anything for it.

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
|debug      |Toggle the debug console|
|update     |Updates the software|
|stop       |Stops the server|


## Chat Commands
There are also chat commands

|Command    | Desc   |
|-----------|--------|
|help       |Displays a list of commands|


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

## Added Mechanics:

##### 1. Bullets
Press f to shoot a bullet. A small, slow, grey object that moves to your destination. Changes direction when ejected mass is shot at it. You can only have 3. Then if you are below 1000 in mass, it will reload the bullets in 25 seconds. But know that if you are above that amount, and 25 seconds pass, then you will lose bullets forever until you die. If you consume your own or are below 500, then it is consumed and you get another bullet to spend (horaay!). If not, then you explode, like a virus, but much severly. There are much more to bullets. But you have to discover them. Have fun!


##### 2. Golden Bullets
There is a very slight chance that when they are reloaded, you get golden bullets instead. Behaves just like normal bullets, except the target literally explodes (slither.io?). You will not be notified when this happens. So let the mystery begin!

##### 3. Wormholes
They are black thingys that you can teleport with. If you collide with one, and you are below the mass of the wormhole, you will be teleported to another wormhole. If you have more than one cell, then the other cells will be lost. If you are bigger, there is a chance that you will teleport (with the one cell rule) while breaking the wormholes, or you may not teleport at all. But if you do or do not, your cell's mass will become the size of the wormhole plus a little more (A strategy might be find the biggest wormhole, become as big as the wormhole, collide, if no tp, then stay, so anyone who tped there will be eaten). 


## Developers

* Andrews54757
* LegitSoulja

## Support
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

## Another Note
This game is different and is not Agar.io or Ogar. It is similar, but very different. We are making a unique game.

