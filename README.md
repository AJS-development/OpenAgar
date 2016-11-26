[![Build Status](https://travis-ci.org/AJS-development/OpenAgar.svg?branch=master)](https://travis-ci.org/AJS-development/OpenAgar) [![Forums](https://img.shields.io/badge/Forums-Ogarul.io-blue.svg)](http://forum.ogarul.io) ![Status](https://img.shields.io/badge/Status-Almost%20Finished-brightgreen.svg) ![Project](https://img.shields.io/badge/Project-Semi--Private-yellow.svg) [![Plugins](https://img.shields.io/badge/Plugins-OAPlugins-green.svg)](https://github.com/AJS-development/OAPlugins)
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
|redraw     |Secret   |
|stop       |Stops the server|


## Chat Commands
There are also chat commands

|Command    | Desc   |
|-----------|--------|
|help       |Displays a list of commands|


## Plugins
Since most of OpenAgar's features doesnt come in the box, plugins are very important. So we made it very easy to install plugins. 

#### The Plugin Command
The plugin command has four important actions. They are

1. install: Install a plugin from a library
2. search: search libraries for plugins
3. library: Add a library
4. add: Add a plugin by url

##### install
> plugin install [name]

Install a plugin from plugin library. The default library is [this](https://github.com/AJS-development/OAPlugins). Note that plugins are case sensitive.

##### search
> plugin search [search term]

Search plugin librarys for plugins matching your search term

##### library
> plugin library [url] 

This adds a library to install/search plugins from. The url is the plugin JSON file with all the plugin data ([example](https://github.com/AJS-development/OAPlugins/blob/master/plugins.json)). All the libraries are stored in `source/commands/lib/libraries`. It is a line-break separated list of urls.

##### add
> plugin add [name] [url]

This adds a plugin from it's url.

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

