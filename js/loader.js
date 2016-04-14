/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of
the game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

window.onload = function(){
	console.log("window.onload called");
	
	// this the sandbox
	app.main.player = app.player;
	app.main.manager = app.manager;
	app.main.enemy = app.enemy;
	app.enemy.emitter = app.emitter;

	// Preload Images and Sound
	app.queue = new createjs.LoadQueue(false);
	app.queue.installPlugin(createjs.Sound);
	app.queue.on("complete", function(e){
		console.log("images loaded called");
		app.main.init();
	});
	
	app.queue.loadManifest([
     {id:"batmanImage", src:"media/batmanAlt.png"},
     {id:"supermanImage", src:"media/superman.png"},
     {id:"platformImage", src:"media/platform.png"},
	 {id:"backgroundImage", src:"media/background.png"},
     {id:"batarang", src:"media/batarang.mp3"},
	 {id:"breath", src:"media/breath.mp3"},
	 {id:"hit", src:"media/hit.mp3"},
	 {id:"impact", src:"media/impact.mp3"},
	 {id:"laser", src:"media/laser.mp3"},
	 {id:"laserSpecial", src:"media/laserSpecial.mp3"},
	 {id:"background", src:"media/fightnight.mp3"},
	]);
	
	window.onblur = function()
	{
		console.log("blur at " + Date());
		app.main.pauseGame();
	};

	window.onfocus = function()
	{
		console.log("focus at " + Date());
		app.main.resumeGame();
	}
}
