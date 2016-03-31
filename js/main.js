// main.js
// Dependencies:
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

/*
 .main is an object literal that is a property of the app global
 This object literal has its own properties and methods (functions)

 */
app.main = {
  // game state properties
    gameState: undefined,
    roundScore: 0,
    totalScore: 0,

    // new property for sound module
    // sound: undefined, // required - loaded by main.js

	//  properties
    WIDTH : 1024,
    HEIGHT: 768,
    canvas: undefined,
    ctx: undefined,
   	lastTime: 0, // used by calculateDeltaTime()
    debug: true,
    paused: false,
    animationID: 0,

    // game state fake enumeration
    GAME_STATE: Object.freeze({
      BEGIN: 0,
      DEFAULT: 1,
      ROUND_OVER: 3,
      REPEAT_LEVEL: 4,
      END: 5,
    }),

    player: {},

    // methods
	init : function() {
		console.log("app.main.init() called");
		// initialize properties
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');

    // initialize gameState
    this.gameState = this.GAME_STATE.BEGIN;

    // hook up events
    this.canvas.onmousedown = this.doMouseDown.bind(this);

    // load level
    this.reset();
	
	this.createPlayer();
	console.log("Created player");

		// start the game loop
		this.update();
	},

  // STUB: resets level
  reset: function(){
  },

	update: function(){
		// schedule a call to update()
    this.animationID = requestAnimationFrame(this.update.bind(this));

	 	// if so, bail out of loop
    if(this.paused)
    {
      this.drawPauseScreen(this.ctx);
      return;
    }

	 	// calculate delta time
	 	var dt = this.calculateDeltaTime();

		// i) draw background
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);

		// iii) draw HUD
    this.ctx.globalAlpha = 1.0;
    this.drawHUD(this.ctx);

	this.handlePlayer(this.dt);
	
    // this.drawPlayer(this.ctx);
	this.drawPlayer(this.ctx);

		// iv) draw debug info
		if (this.debug){
			// draw dt in bottom right corner
			this.fillText(this.ctx, "dt: " + dt.toFixed(3), this.WIDTH - 150, this.HEIGHT - 10, "18pt courier", "white");
		}
	},

	fillText: function(ctx, string, x, y, css, color) {
		ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		ctx.font = css;
		ctx.fillStyle = color;
		ctx.fillText(string, x, y);
		ctx.restore();
	},

	calculateDeltaTime: function(){
		// what's with (+ new Date) below?
		// + calls Date.valueOf(), which converts it from an object to a
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date);
		fps = 1000 / (now - this.lastTime);
		fps = clamp(fps, 12, 60);
		this.lastTime = now;
		return 1/fps;
	}, 

  drawPauseScreen: function(ctx)
  {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,this.WIDTH, this.HEIGHT);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.fillText(this.ctx, "... PAUSED ...", this.WIDTH/2, this.HEIGHT/2, "40pt courier", "white");
    ctx.restore();
  },

  doMouseDown: function(e){
    // this.sound.playBGAudio();

    // unpause on a click
    // just to make sure we never get stuck in a paused state
    if(this.paused){
      this.paused = false;
      this.update();
      return;
    };

    // have to call through app.main because this = canvas
    // can you come up with a better way?
    var mouse = getMouse(e);
  },

  // STUB: check collisions
  checkForCollisions: function(){
  },

  drawHUD: function(ctx){
  	ctx.save(); // NEW

    // code here

  	ctx.restore(); // NEW
  },

  pauseGame: function(){
    this.paused = true;

    // stop the animation loop
    cancelAnimationFrame(this.animationID);

    // call update() once so that our paused screen gets drawn
    this.update();

    this.stopBGAudio();
  },

  resumeGame: function(){
    // stop the animation loop, just in case it's running
    cancelAnimationFrame(this.animationID);

    this.paused = false;

    //restart the loop
    this.update();

    // restart audio
    // this.sound.playBGAudio();
  },

  stopBGAudio: function(){
    // this.sound.stopBGAudio();
  },

  toggleDebug: function(){
    this.debug = !this.debug;
  },

  drawPlayer: function(ctx){
    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(this.player.pos.x, this.player.pos.y, 100, 100);
    ctx.restore();
  },
  
  createPlayer: function(){  
	this.player.pos = new Victor (app.main.canvas.width/2, app.main.canvas.width/2);
	this.player.vel = new Victor(0,0);
	this.player.acc = new Victor(0,0);
	this.player.speed = 5;
	this.player.friction = 0.95;
	Object.seal(this.player);
  },
  
  handlePlayer: function(dt){
	
	  // move up using 'w' key
    if(myKeys.keydown[myKeys.KEYBOARD.KEY_W]){
      this.player.pos.y -= 2;
    }

    // move down using 's' key
    if(myKeys.keydown[myKeys.KEYBOARD.KEY_S]){
      this.player.pos.y += 2;
    }

    // move right using 'd' key
    if(myKeys.keydown[myKeys.KEYBOARD.KEY_D]){
		this.player.vel.add(Victor(1,0));
    }

    // move left using 'a' key
    if(myKeys.keydown[myKeys.KEYBOARD.KEY_A]){
		this.player.vel.add(Victor(-1,0));
    }
	
	// this.player.vel.normalize();
	// this.player.vel.multiplyScalar(this.player.speed);
	this.player.vel.multiplyScalar(this.player.friction);
	this.player.pos.add(this.player.vel);
  },

}; // end app.main
