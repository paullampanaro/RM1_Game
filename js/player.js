// player object
"use strict";

var app = app || {};

app.player = (function(){

	var player = {};
	var playerImage = new Image();
	playerImage.src = "media/batman.png";

	var playerImage2 = new Image();
	playerImage2 .src = "media/batman2.png";

	var projectiles = [];
	var canFire = true;
	var fireTimer = 0;
	var fireCap = 15;

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

	// sprite animation variables
	var frameWidth = 70;
	var frameHeight = 70;
	var tickCount = 0;
	var ticksPerFrame = 2;
	var frameStartIndex = 19
	var frameEndIndex = 25;
	var frameIndex = frameStartIndex;
	var numCols = 6;
	var faceRight = true;
	var grounded = true;
	var previous = false;

	function createPlayer(){

		player.pos = new Victor (app.main.canvas.width/2, app.main.canvas.height - frameHeight);
		player.vel = new Victor(0,0);
		player.speed = 3;
		player.friction = 0.90;
		player.jump = 0;

		Object.seal(player);
	}

	function drawPlayer(ctx){

		handleSprite();
		handleFrameIndex();

		if(faceRight)
			var col = (frameIndex % numCols);
		else
			var col = numCols - (frameIndex % numCols);

		var row = Math.floor(frameIndex / numCols);
		var frameX = col * frameWidth;
		var frameY = row * frameHeight;

		if(faceRight)
			ctx.drawImage(playerImage,
				frameX, frameY, frameWidth, frameHeight,
				player.pos.x, player.pos.y, frameWidth, frameHeight);
		else
			ctx.drawImage(playerImage2,
				frameX, frameY, frameWidth, frameHeight,
				player.pos.x, player.pos.y, frameWidth, frameHeight);
	}

	function handlePlayer(dt){

    	// move right using 'd' key
    	if(myKeys.keydown[myKeys.KEYBOARD.KEY_D]){
    		player.vel.add(Victor(1,0));

    		spriteState = SPRITE_STATE.RUNNING;
    		faceRight = true;
    	}

    	// move left using 'a' key
    	if(myKeys.keydown[myKeys.KEYBOARD.KEY_A]){
    		player.vel.add(Victor(-1,0));

    		spriteState = SPRITE_STATE.RUNNING;
    		faceRight = false;
    	}

    	// move up using 'w' key
	  	if(myKeys.keydown[myKeys.KEYBOARD.KEY_W]){
	  		if (player.jump < 300){
	  			player.pos.y -= 10;
	  		}
	  		player.jump += 10;

	  		spriteState = SPRITE_STATE.JUMPING;
	  		grounded = false;
	  	}

	  	// crouching down with 's' key
	  	if(myKeys.keydown[myKeys.KEYBOARD.KEY_S]){

	  		player.speed = 0;
	  		spriteState = SPRITE_STATE.CROUCHING;
	  	}
	  	else
	  		player.speed = 5;

		// this.player.vel.normalize();
		// this.player.vel.multiplyScalar(this.player.speed);
		player.vel.multiplyScalar(player.friction);
		player.pos.add(player.vel);

		if(player.pos.y < app.main.canvas.height - frameHeight){
			player.pos.y += 6;
		}

		if(player.pos.y >= app.main.canvas.height - frameHeight){
			grounded = true;
		}

		if(grounded == true){
			player.jump = 0;
		}

		if(player.pos.x < 0){
			player.pos.x = 0;
		}
		else if(player.pos.x  >= app.main.canvas.width - frameHeight){
			player.pos.x = app.main.canvas.width - frameHeight;
		}

		if(!myKeys.keydown[myKeys.KEYBOARD.KEY_A] && !myKeys.keydown[myKeys.KEYBOARD.KEY_D]
			&& !myKeys.keydown[myKeys.KEYBOARD.KEY_W] && !myKeys.keydown[myKeys.KEYBOARD.KEY_S])
		{
			spriteState = SPRITE_STATE.IDLE;
			grounded = false;
		}
	}

	function handleFrameIndex()
	{
		// sprite animation

		tickCount += 1;

		if(tickCount >= ticksPerFrame)
		{
			tickCount = 0;
			frameIndex += 1;
		}

		// frameIndex += 1;

		if(frameIndex > frameEndIndex)
		{
			frameIndex = frameStartIndex;
		}
	}

	function handleSprite()
	{
		if(spriteState == SPRITE_STATE.IDLE)
		{
			frameStartIndex = 11;
			frameEndIndex = 11;
		}

		if(spriteState == SPRITE_STATE.RUNNING)
		{
			frameStartIndex = 18;
			frameEndIndex = 23;
		}

		if(spriteState == SPRITE_STATE.JUMPING)
		{
			frameStartIndex = 26;
			frameEndIndex = 26;

			if(frameIndex == frameEndIndex)
			{
				// spriteState == SPRITE_STATE.IDLE;
			}
		}

		if(spriteState == SPRITE_STATE.CROUCHING)
		{
			frameStartIndex = 27;
			frameEndIndex = 27;
		}

		if(spriteState == SPRITE_STATE.THROWING)
		{

		}

		if(spriteState == SPRITE_STATE.DYING)
		{

		}
	}

	//Handle collisions - takes the x position, y postion, width and height of the object you are checking collisions with
	function handleCollisions(xPos, yPos, width, height){
	var r1Width = xPos + width;
	var r1Height = yPos + height;
	var r2Width = player.pos.x + frameWidth;
	var r2Height = player.pos.y + frameHeight;
	if(r1Width >= player.pos.x && xPos <= r2Width && r1Height >= player.pos.y && yPos <= r2Height){
		if(r2Width >= xPos && player.pos.x < xPos && player.pos.y < r1Height && r2Height >= r1Height){
			player.pos.x = xPos - frameWidth;
		}
		else if(r2Width >= r1Width && player.pos.x < r1Width && player.pos.y <= yPos && r2Height > yPos){
			player.pos.x = r1Width;
		}
		else if(r2Width >= xPos && player.pos.x < xPos && r2Height < yPos){
			player.pos.x = xPos - frameWidth;
		}
		else if(r2Width >= r1Width && player.pos.x < r1Width && r2Height < yPos){
			player.pos.x = r1Width;
		}
		else if(player.pos.y < r1Height && r2Height >= r1Height){
			player.pos.y = r1Height;
		}
		else if(player.pos.y <= yPos && r2Height > yPos){
			player.pos.y = yPos - frameHeight;
			grounded = true;
		}
	}
	else {
		return false;
	}
}

	function findPlayer()
	{
		return player.pos;
	}

	function handleProjectiles(ctx)
	{
		fireTimer += 1;
		if(fireTimer >= fireCap)
		{
			fireTimer = 0;
			canFire = true;
		}

		for(var i = 0; i < projectiles.length; i++)
		{
			var c = projectiles[i];

			if(c.pos.x > app.main.canvas.width || c.pos.y > app.main.height || c.pos.x < 0 || c.pos.y < 0)
			{
				projectiles.splice(i, 1);
			}

			c.pos.add(c.vel);

			ctx.save();
			ctx.strokeStyle = "black";
			ctx.lineWidth = 3;
			ctx.lineCap = "rounded";
			ctx.beginPath();
			ctx.moveTo(c.pos.x, c.pos.y);
			ctx.lineTo((c.pos.x + c.vel.x), (c.pos.y + c.vel.y));
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
	}

	var fireProjectile = function(x, y)
	{
		if(canFire)
		{
			var projectile = {};
			projectile.pos = new Victor(player.pos.x, player.pos.y);
			projectile.vel = new Victor(x - player.pos.x, y - player.pos.y);
			projectile.speed = 5;

			// recalculate speed;
			projectile.vel.normalize();
			projectile.vel.multiplyScalar(projectile.speed);

			Object.seal(projectile);
			projectiles.push(projectile);
			canFire = false;
		}
	}

  return{
  	createPlayer: createPlayer,
  	drawPlayer: drawPlayer,
  	handlePlayer: handlePlayer,
  	handleCollisions: handleCollisions,
  	findPlayer: findPlayer,
		handleProjectiles: handleProjectiles,
		fireProjectile: fireProjectile,
  };

}());
