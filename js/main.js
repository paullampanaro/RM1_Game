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

  // property for player module
  player: undefined,
  enemy: undefined,

  //property for manager module
  manager: undefined,

  PLATFORMWIDTH: 200,
  PLATFORMHEIGHT: 20,
  PLATFORMLEFTX: 100,
  PLATFORMRIGHTX: 700,
  PLATFORMMIDX: 400,

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
      INSTRUCTIONS: 2,
      ROUND_OVER: 3,
      REPEAT_LEVEL: 4,
      END: 5,
    }),

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

    this.player.createPlayer();
    this.enemy.createEnemy();

    //Create the world and its respective collision checks
    //this.manager.createManager();
    //console.log("Created manager");

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
    this.ctx.fillStyle = "#6495ed";
    this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);

    if(this.gameState == this.GAME_STATE.BEGIN || this.gameState == this.GAME_STATE.INSTRUCTIONS){
      this.drawHUD(this.ctx);
    } else {
      //Create Platforms
      this.ctx.fillStyle = "red";
      this.ctx.fillRect(this.PLATFORMLEFTX, 668, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMRIGHTX, 668, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMMIDX, 568, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMLEFTX, 468, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMRIGHTX, 468, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMMIDX, 368, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMLEFTX, 268, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMRIGHTX, 268, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMMIDX, 168, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);

  		// iii) draw HUD
      this.ctx.globalAlpha = 1.0;
      this.drawHUD(this.ctx);

      this.player.handlePlayer(this.dt);
      this.enemy.handleEnemy(this.dt);

      this.player.drawPlayer(this.ctx);
      this.enemy.drawEnemy(this.ctx);

      this.player.handleProjectiles(this.ctx);
      this.enemy.handleProjectiles(this.ctx);

      //Check for collisions
      this.player.handleCollisions(this.PLATFORMLEFTX, 668, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.player.handleCollisions(this.PLATFORMRIGHTX, 668, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.player.handleCollisions(this.PLATFORMMIDX, 568, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.player.handleCollisions(this.PLATFORMLEFTX, 468, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.player.handleCollisions(this.PLATFORMRIGHTX, 468, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.player.handleCollisions(this.PLATFORMMIDX, 368, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.player.handleCollisions(this.PLATFORMLEFTX, 268, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.player.handleCollisions(this.PLATFORMRIGHTX, 268, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.player.handleCollisions(this.PLATFORMMIDX, 168, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);

  		// iv) draw debug info
      if (this.debug){
      	// draw dt in bottom right corner
      	this.fillText(this.ctx, "dt: " + dt.toFixed(3), this.WIDTH - 150, this.HEIGHT - 10, "18pt courier", "white");
      }
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
    this.fillText(this.ctx, "... PAUSED ...", this.WIDTH/2, this.HEIGHT/2, "50pt Bangers", "white");
    ctx.restore();
  },

  doMouseDown: function(e){
    // this.sound.playBGAudio();
    var mouse = getMouse(e);
    // unpause on a click
    // just to make sure we never get stuck in a paused state
    if(this.paused){
      this.paused = false;
      this.update();
      return;
    };

    if(this.gameState == this.GAME_STATE.BEGIN && mouse.x > this.WIDTH/2 - 100 && mouse.x < this.WIDTH/2 + 102.5 && mouse.y > this.HEIGHT/2 - 110 && mouse.y < this.HEIGHT/2 - 50){
      this.gameState = this.GAME_STATE.DEFAULT;
    }

    if(this.gameState == this.GAME_STATE.BEGIN && mouse.x > this.WIDTH/2 - 130 && mouse.x < this.WIDTH/2 + 135 && mouse.y > this.HEIGHT/2 - 30 && mouse.y < this.HEIGHT/2 + 30){
      this.gameState = this.GAME_STATE.INSTRUCTIONS;
    }

    if(this.gameState == this.GAME_STATE.INSTRUCTIONS && mouse.x > 40 && mouse.x < 270 && mouse.y > this.HEIGHT - 90 && mouse.y < this.HEIGHT - 30){
      this.gameState = this.GAME_STATE.BEGIN;
    }

    if(this.gameState == this.GAME_STATE.DEFAULT)
    {
      this.player.fireProjectile(mouse.x, mouse.y);
    }

    // have to call through app.main because this = canvas
    // can you come up with a better way?
    var mouse = getMouse(e);
  },

  drawHUD: function(ctx){
  	ctx.save();

    if(this.gameState == this.GAME_STATE.BEGIN){
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.WIDTH/2 - 100, this.HEIGHT/2 - 110, 205, 60);
      ctx.strokeRect(this.WIDTH/2 - 130, this.HEIGHT/2 - 30, 270, 60);
      this.fillText(ctx, "Batman vs Superman", this.WIDTH/2, this.HEIGHT/2 - 250,"80pt Bangers", "white");
      this.fillText(ctx, "Play Game", this.WIDTH/2, this.HEIGHT/2 - 80,"40pt Bangers", "white");
      this.fillText(ctx, "Instructions", this.WIDTH/2, this.HEIGHT/2,"40pt Bangers", "white");
    }

    if(this.gameState == this.GAME_STATE.INSTRUCTIONS){
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, this.HEIGHT - 90, 230, 60);
      this.fillText(ctx, "Instructions", this.WIDTH/2, this.HEIGHT/2 - 250,"80pt Bangers", "white");
      this.fillText(ctx, "Use A and D to move left and right", this.WIDTH/2, this.HEIGHT/2 - 80,"40pt Bangers", "white");
      this.fillText(ctx, "Use W to jump", this.WIDTH/2, this.HEIGHT/2,"40pt Bangers", "white");
      this.fillText(ctx, "Click to throw Batarang", this.WIDTH/2, this.HEIGHT/2 + 80,"40pt Bangers", "white");
      this.fillText(ctx, "Main Menu", 150, this.HEIGHT - 60,"40pt Bangers", "white");
    }

    if(this.gameState == this.GAME_STATE.ROUND_OVER){
      ctx.save();
    }

    if(this.gameState == this.GAME_STATE.DEFAULT){
      ctx.save();
    }

    // game over screen
    if(this.gameState == this.GAME_STATE.END){
      ctx.save();
    }

    ctx.restore();
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
    // this.debug = !this.debug;
  },

}; // end app.main
