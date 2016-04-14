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
  
  // this controls difficulty
  roundIndex: 0,

  // background
  background: undefined,
  backgroundMusic: undefined,

  // modules
  player: undefined,
  enemy: undefined,
  queue: undefined,
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
      VICTORY: 3,
      LOST: 4,
      END: 5,
      CONTROLS: 6,
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

    this.background = app.queue.getResult("backgroundImage");
	this.backgroundMusic = createjs.Sound.play("background",{loop:-1, volume:0.4});

    // hook up events
    this.canvas.onmousedown = this.doMouseDown.bind(this);

    // load level
    //this.reset();
    this.roundIndex = 0;
    this.player.setLevel(this.roundIndex);
    this.enemy.setLevel(this.roundIndex);

    this.player.createPlayer();
    this.enemy.createEnemy();
    //Create Platforms
    this.manager.createPlatforms();

		// start the game loop
		this.update();
	},

  // STUB: resets level
  reset: function(){
    if(this.roundIndex == 0)
      this.gameState = this.GAME_STATE.BEGIN;
    else
      this.gameState = this.GAME_STATE.DEFAULT;

    this.player.setLevel(this.roundIndex);
    this.enemy.setLevel(this.roundIndex);

    this.player.createPlayer();
    this.enemy.createEnemy();

    // start the game loop
    this.update();
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
    // this.ctx.fillStyle = "#6495ed";
    // this.ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);

    this.ctx.drawImage(this.background, 0,0,1024,768);

    if(this.gameState == this.GAME_STATE.BEGIN || this.gameState == this.GAME_STATE.INSTRUCTIONS || 
        this.gameState == this.GAME_STATE.VICTORY || this.gameState == this.GAME_STATE.LOST || this.gameState == this.GAME_STATE.CONTROLS){
      this.drawHUD(this.ctx);
    } 

    if(this.gameState == this.GAME_STATE.VICTORY || this.gameState == this.GAME_STATE.LOST)
    {
      cancelAnimationFrame(this.animationID);
    }

    if (this.gameState == this.GAME_STATE.DEFAULT)
    {
  		// iii) draw HUD
      this.ctx.globalAlpha = 1.0;
      this.drawHUD(this.ctx);

      //Handle player and enemy
      this.player.handlePlayer(this.dt);
      this.enemy.handleEnemy(this.dt);

      //Check for collisions
      this.manager.handlePlatforms(this.ctx);

      //Draw
      this.player.drawPlayer(this.ctx);
      this.enemy.drawEnemy(this.ctx);

      //Handle projectiles
      this.player.handleProjectiles(this.ctx);
      this.enemy.handleProjectiles(this.ctx);

      //If the enemy is killed you wim
      if(this.enemy.findEnemy().y > this.HEIGHT)
      {
        if(this.enemy.findEnemyHealth() <= 0)
         this.gameState = this.GAME_STATE.VICTORY;
      }

      //If you die you lose
      if(this.player.findPlayerHealth() <= 0 && this.player.isOver())
      {
        this.gameState = this.GAME_STATE.LOST;
      }

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
    this.fillText(this.ctx, "Click to resume", this.WIDTH/2, this.HEIGHT/2 + 100, "50pt Bangers", "white");
    ctx.restore();
  },

  doMouseDown: function(e){
    var mouse = getMouse(e);
    // unpause on a click
    // just to make sure we never get stuck in a paused state
    if(this.paused){
      this.paused = false;
      this.update();
      return;
    };

    //Change the gmae state depending on the button you click 
    if(this.gameState == this.GAME_STATE.BEGIN && mouse.x > this.WIDTH/2 - 100 && mouse.x < this.WIDTH/2 + 102.5 && mouse.y > this.HEIGHT/2 - 110 && mouse.y < this.HEIGHT/2 - 50){
      this.gameState = this.GAME_STATE.DEFAULT;
    }

    if(this.gameState == this.GAME_STATE.BEGIN && mouse.x > this.WIDTH/2 - 130 && mouse.x < this.WIDTH/2 + 135 && mouse.y > this.HEIGHT/2 - 30 && mouse.y < this.HEIGHT/2 + 30){
      this.gameState = this.GAME_STATE.INSTRUCTIONS;
    }

    if(this.gameState == this.GAME_STATE.BEGIN && mouse.x > this.WIDTH/2 - 110 && mouse.x < this.WIDTH/2 + 95 && mouse.y > this.HEIGHT/2 + 45 && mouse.y < this.HEIGHT/2 + 105){
      this.gameState = this.GAME_STATE.CONTROLS;
    }

    if(this.gameState == this.GAME_STATE.INSTRUCTIONS && mouse.x > 40 && mouse.x < 270 && mouse.y > this.HEIGHT - 90 && mouse.y < this.HEIGHT - 30){
      this.gameState = this.GAME_STATE.BEGIN;
    }

    if(this.gameState == this.GAME_STATE.CONTROLS && mouse.x > 40 && mouse.x < 270 && mouse.y > this.HEIGHT - 90 && mouse.y < this.HEIGHT - 30){
      this.gameState = this.GAME_STATE.BEGIN;
    }

    if(this.gameState == this.GAME_STATE.VICTORY && mouse.x > 40 && mouse.x < 270 && mouse.y > this.HEIGHT - 90 && mouse.y < this.HEIGHT - 30){
      this.roundIndex = 0;
      this.reset();
    }

    if(this.gameState == this.GAME_STATE.VICTORY && mouse.x > this.WIDTH - 260 && mouse.x < this.WIDTH - 260 + 230 && mouse.y > this.HEIGHT - 90 && mouse.y < this.HEIGHT - 30){
      // start the level again
      this.roundIndex += 1;
      this.reset();
    }

    if(this.gameState == this.GAME_STATE.LOST && mouse.x > 40 && mouse.x < 270 && mouse.y > this.HEIGHT - 90 && mouse.y < this.HEIGHT - 30){
      this.roundIndex = 0;
      this.reset();
    }

    if(this.gameState == this.GAME_STATE.LOST && mouse.x > this.WIDTH - 260 && mouse.x < this.WIDTH - 260 + 230 && mouse.y > this.HEIGHT - 90 && mouse.y < this.HEIGHT - 30){
      // start the next level
      this.reset();
    }

    //Fire batarangs when you click in game
    if(this.gameState == this.GAME_STATE.DEFAULT && this.player.findPlayerHealth() > 0)
    {
      this.player.fireProjectile(mouse.x, mouse.y);
    }

    // have to call through app.main because this = canvas
    // can you come up with a better way?
    var mouse = getMouse(e);
  },

  //Draw the hud depending on the game state
  drawHUD: function(ctx){
  	ctx.save();

    //Main Menu
    if(this.gameState == this.GAME_STATE.BEGIN){
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.WIDTH/2, this.HEIGHT);
      ctx.fillStyle = "blue";
      ctx.fillRect(this.WIDTH/2, 0, this.WIDTH/2, this.HEIGHT);
      this.fillText(ctx, "Batman v", 150, 100,"80pt Bangers", "yellow");
      this.fillText(ctx, "s Superman", this.WIDTH/2, 100,"80pt Bangers", "red");
      this.fillText(ctx, "Play", this.WIDTH/2 - 95, this.HEIGHT/2 - 105,"40pt Bangers", "yellow");
      this.fillText(ctx, "Game", this.WIDTH/2, this.HEIGHT/2 - 105,"40pt Bangers", "red");
      this.fillText(ctx, "Instru", this.WIDTH/2 - 125, this.HEIGHT/2 - 30,"40pt Bangers", "yellow");
      this.fillText(ctx, "ctions", this.WIDTH/2, this.HEIGHT/2 - 30,"40pt Bangers", "red");
      this.fillText(ctx, "Cont", this.WIDTH/2 - 95, this.HEIGHT/2 + 45,"40pt Bangers", "yellow");
      this.fillText(ctx, "rols", this.WIDTH/2, this.HEIGHT/2 + 45,"40pt Bangers", "red");
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeRect(this.WIDTH/2 - 100, this.HEIGHT/2 - 110, 205, 60);
      ctx.strokeRect(this.WIDTH/2 - 130, this.HEIGHT/2 - 30, 270, 60);
      ctx.strokeRect(this.WIDTH/2  - 110, this.HEIGHT/2 + 45, 205, 60);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      this.fillText(ctx, "By: Paul Lampanaro and Gregory McClellan", 225, this.HEIGHT - 50,"20pt Bangers", "yellow");
      this.fillText(ctx, "Batman and Superman are trademarked by DC, we do not own the characters", 300, this.HEIGHT - 20,"15pt Bangers", "white");
    }

    // instructions
    if(this.gameState == this.GAME_STATE.INSTRUCTIONS){
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, this.HEIGHT - 90, 230, 60);
      this.fillText(ctx, "Controls", this.WIDTH/2, this.HEIGHT/2 - 250,"80pt Bangers", "yellow");
      this.fillText(ctx, "Use A and D to move left and right", this.WIDTH/2, this.HEIGHT/2 - 80,"40pt Bangers", "yellow");
      this.fillText(ctx, "Use W to jump", this.WIDTH/2, this.HEIGHT/2,"40pt Bangers", "yellow");
      this.fillText(ctx, "Use S to crouch", this.WIDTH/2, this.HEIGHT/2 + 80,"40pt Bangers", "yellow");
      this.fillText(ctx, "Left click to throw Batarang", this.WIDTH/2, this.HEIGHT/2 + 160,"40pt Bangers", "yellow");
      this.fillText(ctx, "Press P to pause", this.WIDTH/2, this.HEIGHT/2 + 240,"40pt Bangers", "yellow");
      this.fillText(ctx, "Main Menu", 150, this.HEIGHT - 60,"40pt Bangers", "yellow");
    }

    //Instructions Screen
    if(this.gameState == this.GAME_STATE.CONTROLS){
      console.log("Uh");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, this.HEIGHT - 90, 230, 60);
      this.fillText(ctx, "Instructions", this.WIDTH/2, this.HEIGHT/2 - 250,"80pt Bangers", "yellow");
      this.fillText(ctx, "Take down Superman!", this.WIDTH/2, 180 + 50, "20pt Bangers", "yellow");
      this.fillText(ctx, "Hit Superman with your Kryptonite Batarangs while avoiding his attacks.", this.WIDTH/2, 220 + 50, "20pt Bangers", "yellow");
      this.fillText(ctx, "Crouching will reduce damage from lasers and will negate damage from frost breath,", this.WIDTH/2, 260 + 50, "20pt Bangers", "yellow");
      this.fillText(ctx, "But will also keep you from moving", this.WIDTH/2, 300 + 50, "20pt Bangers", "yellow");
      this.fillText(ctx, "Falling off the screen will kill you.", this.WIDTH/2, 340 + 50, "20pt Bangers", "yellow");
      this.fillText(ctx, "Each round will increase Superman's rate of fire and damage,", this.WIDTH/2, 380 + 50, "20pt Bangers", "yellow");
      this.fillText(ctx, "Your rate of fire will be reduced and Superman will be more likely to blitz you.", this.WIDTH/2, 420 + 50, "20pt Bangers", "yellow");
      this.fillText(ctx, "Main Menu", 150, this.HEIGHT - 60,"40pt Bangers", "yellow");
    }

    //In game hud
    if(this.gameState == this.GAME_STATE.DEFAULT){
      this.fillText(ctx, "Batman Health: " + this.player.findPlayerHealth(), 20, 60,"30pt Bangers", "white");
      this.fillText(ctx, "Round: " + this.roundIndex, this.WIDTH/2 - 100, 60, "30pt Bangers", "white");
      this.fillText(ctx, "Superman Health: " + this.enemy.findEnemyHealth(), this.WIDTH - 375, 60,"30pt Bangers", "white");
    }

    //Win Screen
    if(this.gameState == this.GAME_STATE.VICTORY){
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, this.HEIGHT - 90, 230, 60);
      ctx.strokeRect(this.WIDTH - 260, this.HEIGHT - 90, 230, 60);
      this.fillText(ctx, "You Won!", this.WIDTH/2, this.HEIGHT/2,"80pt Bangers", "yellow");
      this.fillText(ctx, "Main Menu", 150, this.HEIGHT - 60,"40pt Bangers", "yellow");
      this.fillText(ctx, "Next Round", this.WIDTH - 150, this.HEIGHT - 60, "40pt Bangers", "yellow");
    }

    // game over screen
    if(this.gameState == this.GAME_STATE.LOST){
      ctx.fillStyle = "blue";
      ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, this.HEIGHT - 90, 230, 60);
      ctx.strokeRect(this.WIDTH - 260, this.HEIGHT - 90, 230, 60);
      this.fillText(ctx, "You Lost!", this.WIDTH/2, this.HEIGHT/2,"80pt Bangers", "red");
      this.fillText(ctx, "Main Menu", 150, this.HEIGHT - 60,"40pt Bangers", "red");
      this.fillText(ctx, "Try Again", this.WIDTH - 150, this.HEIGHT - 60, "40pt Bangers", "red");
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
    this.backgroundMusic.resume();
  },

  stopBGAudio: function(){
    this.backgroundMusic.pause();
  },

  toggleDebug: function(){
    // this.debug = !this.debug;
  },

}; // end app.main
