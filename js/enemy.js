"use strict";

var app = app || {};

app.enemy = (function(){

	var enemy = {};
	var enemyImage = new Image();
	enemyImage.src = "media/superman.png";
	var enemyImage2 = new Image();
	enemyImage2.src = "media/superman2.png";

	var projectiles = {};

	// enemy sprite variables
	var frameWidth = 110;
	var frameHeight = 110;
	var tickCount = 0;
	var ticksPerFrame = 1;
	var frameStartIndex = 19
	var frameEndIndex = 25;
	var frameIndex = frameStartIndex;
	var numCols = 6;
	var randomTarget = undefined;

	// sprite state fake enumeration
    var SPRITE_STATE = Object.freeze({
      IDLE: 0,
      RUNNING: 1,
      JUMPING: 3,
      THOWING: 4,
      CROUCHING: 5,
      DYING: 6,
    });

    var spriteState = SPRITE_STATE.IDLE;

    function createEnemy()
    {
    	enemy.pos = new Victor (app.main.canvas.width/2, app.main.canvas.height - frameHeight - 500);
		enemy.vel = new Victor(0,0);
		enemy.acc = new Victor(0,0);
		enemy.speed = 6;
		enemy.friction = 0.99;

		Object.seal(enemy);
    }

    function drawEnemy(ctx)
    {
    	handleSprite();
		// handleFrameIndex();

		/*
		var col = (frameIndex % numCols);
		var row = Math.floor(frameIndex / numCols);
		var frameX = col * frameWidth;
		var frameY = row * frameHeight;
		*/

		var frameX = 570; //680
		var frameY = 420; //530

		ctx.drawImage(enemyImage, 
			frameX, frameY, frameWidth, frameHeight,
			enemy.pos.x, enemy.pos.y, frameWidth, frameHeight);
    }

    function handleEnemy()
    {
    	if(randomTarget == undefined)
    	{
    		randomTarget = new Victor(Math.random() * app.main.canvas.width, Math.random() * app.main.canvas.height);
    	}

    	enemy.acc = new Victor(randomTarget.x - enemy.pos.x, randomTarget.y - enemy.pos.y);
    	enemy.vel.add(enemy.acc);
    	enemy.vel.normalize();
    	enemy.vel.multiplyScalar(enemy.speed);
    	enemy.pos.add(enemy.vel);

    	if(enemy.pos.distance(randomTarget) < 5)
    	{
    		randomTarget = new Victor(Math.random() * app.main.canvas.width, Math.random() * app.main.canvas.height);
    	}
    }

    function handleSprite()
    {

    }

    function fireProjectile(ctx)
    {
    	var playerPos = app.main.player.findPlayer();

    	ctx.save();
    	ctx.strokeStyle = "red";
    	ctx.lineWidth = 10;
    	ctx.beginPath();
    	ctx.moveTo(enemy.pos.x , enemy.pos.y);
    	ctx.lineTo(playerPos.x, playerPos.y);
    	ctx.stroke();
    	ctx.restore();
    }

    return{
  		createEnemy: createEnemy,
  		drawEnemy: drawEnemy,
  		handleEnemy: handleEnemy,
  		fireProjectile: fireProjectile, // temporary, move this
  };

}());