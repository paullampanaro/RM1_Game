// player object
"use strict";

var app = app || {};

app.player = (function(){

	var player = {};
	var playerImage;

	var projectiles = [];
	var canFire = false;
	var fireTimer = 0;
	var fireCap = 1;
	var fireSpeed = 5;

	// frame height for collisions
	var frameWidth = 80;
	var frameHeight = 80;

	// sprite state fake enumeration
    var SPRITE_STATE = Object.freeze({
      IDLE: 0,
      RUNNING: 1,
      JUMPING: 3,
      THOWING: 4,
      CROUCHING: 5,
      DYING: 6,
    });

	// sprite animation variables
	var frameX = 0;
	var frameY = 0;
	var spriteWidth = 110;
	var spriteHeight = 110;
	var frameIndex = 0;
	var frameCap = 1;

	var over = false;
	var dead = false;
	var deadTimer = 0;
	var deadCap = 60 * 5;
	var spriteState = SPRITE_STATE.IDLE;

	var faceRight = true;
	var grounded = true;
	var previous = false;

	function createPlayer(){

		playerImage = app.queue.getResult("batmanImage");
		over = false;
		dead = false;
		deadTimer = 0;
		projectiles = [];
		
		player.pos = new Victor (app.main.canvas.width/2, app.main.canvas.height - frameHeight - 240);
		player.vel = new Victor(0,0);
		player.speed = 3;
		player.maxSpeed = 6;
		player.acc = new Victor(0,0);
		player.friction = 0.90;
		player.jump = 0;
		projectiles= [];
		player.health = 100;

		Object.seal(player);
	}

	function drawPlayer(ctx){

		handleSprite();
		handleFrameIndex();

		var col = frameX + (spriteWidth * frameIndex);
		var row = frameY;

		if(faceRight)
			ctx.drawImage(playerImage,
				col, row, spriteWidth, spriteHeight,
				player.pos.x, player.pos.y, frameWidth, frameHeight);
		else
		{
			ctx.save();
			ctx.translate(player.pos.x + frameWidth, player.pos.y);
			ctx.scale(-1, 1);
			ctx.drawImage(playerImage,
				col, row, spriteWidth, spriteHeight,
				0, 0, frameWidth, frameHeight);
			ctx.restore();
		}
	}

	function handlePlayer(dt){

		player.acc = new Victor(0,0);

    	// move right using 'd' key
    	if(myKeys.keydown[myKeys.KEYBOARD.KEY_D] && !dead){
    		player.acc.add(Victor(1,0));

    		spriteState = SPRITE_STATE.RUNNING;
    		faceRight = true;
    	}

    	// move left using 'a' key
    	if(myKeys.keydown[myKeys.KEYBOARD.KEY_A] && !dead){
    		player.acc.add(Victor(-1,0));

    		spriteState = SPRITE_STATE.RUNNING;
    		faceRight = false;
    	}

    	// jump using 'w' key
	  	if(myKeys.keydown[myKeys.KEYBOARD.KEY_W] && !dead){
	  		if (player.jump < 300 && !myKeys.keydown[myKeys.KEYBOARD.KEY_S]){
	  			player.pos.y -= 11;
	  		}
	  		player.jump += 10;

	  		// spriteState = SPRITE_STATE.JUMPING;
	  		grounded = false;
	  	}

	  	// crouching down with 's' key
	  	if(myKeys.keydown[myKeys.KEYBOARD.KEY_S] && !dead){

	  		player.speed = 0;
	  		spriteState = SPRITE_STATE.CROUCHING;
	  	}
	  	else
	  		player.speed = 3;

		player.acc.multiplyScalar(player.speed);
		player.vel.add(player.acc);

		if(player.vel.magnitude() > player.maxSpeed)
		{
			player.vel.normalize();
			player.vel.multiplyScalar(player.maxSpeed);
		}

		player.vel.multiplyScalar(player.friction);
		player.pos.add(player.vel);

		if(player.pos.y < app.main.canvas.height){
			player.pos.y += 6;
		}

		if(player.pos.y >= app.main.canvas.height){
			player.health = 0;
		}

		if(grounded == true){
			player.jump = 0;
		}
		else
		{
			spriteState = SPRITE_STATE.JUMPING;
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

		if(player.health <= 0)
		{
			dead = true;
			spriteState = SPRITE_STATE.DYING;
		}

		if(dead)
		{
			deadTimer += 1;
			if(deadTimer > deadCap)
				over = true;
		}
	}

	function handleFrameIndex()
	{
		// sprite animation
		frameIndex += 1;

		// frameIndex += 1;

		if(frameIndex >= frameCap)
		{
			frameIndex = 0;
		}
	}

	function handleSprite()
	{
		if(spriteState == SPRITE_STATE.IDLE)
		{
			frameX = 95;
			frameY = 0;
			frameCap = 1;
			spriteWidth = 110;
			spriteHeight = 120;
		}

		if(spriteState == SPRITE_STATE.RUNNING)
		{
			frameX = 705;
			frameY = 410;
			frameCap = 1;
			spriteWidth = 155;
			spriteHeight = 90;
		}

		if(spriteState == SPRITE_STATE.JUMPING)
		{
			frameX = 150;
			frameY = 140;
			frameCap = 1;
			spriteWidth = 150;
			spriteHeight = 130;
		}

		if(spriteState == SPRITE_STATE.CROUCHING)
		{
			frameX = 945;
			frameY = 10;
			frameCap = 1;
			spriteWidth = 125; 
			spriteHeight = 120;
		}

		if(spriteState == SPRITE_STATE.THROWING)
		{
			frameX = 290;
			frameY = 675;
			frameCap = 1;
			spriteWidth = 170;
			spriteHeight = 120;
		}

		if(spriteState == SPRITE_STATE.DYING)
		{
			frameX = 250;
			frameY = 920;
			frameCap = 1;
			spriteWidth = 120;
			spriteHeight = 120;
		}
	}

	//Handle collisions - takes the x position, y postion, width and height of the object you are checking collisions with
	function handleCollisions(xPos, yPos, width, height){
	var r1Width = xPos + width;
	var r1Height = yPos + height;
	var r2Width = player.pos.x + frameWidth;
	var r2Height = player.pos.y + frameHeight;
	//Some crazy math, depending on where the player is colliding, move them accordingly
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
	
	//Getter for player position
	function findPlayer()
	{
		return new Victor(player.pos.x + (frameWidth/2), player.pos.y + (frameHeight/2));
	}

	//Getter for player health
	function findPlayerHealth()
	{
		return player.health;
	}

	function isOver()
	{
		return over;
	}

	//Setter for player health
	function setPlayerHealth(newHealth)
	{
		var damage = newHealth;

		if(spriteState == SPRITE_STATE.CROUCHING)
			damage -= 4;

		if(damage < 0)
			damage = 0;

		player.health -= damage;
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

			// handle sprite animation
			ctx.drawImage(playerImage, c.frameX + (c.frameIndex * c.frameWidth), c.frameY, c.frameWidth, c.frameHeight, c.pos.x, c.pos.y, c.frameWidth, frameHeight);

			c.tick += 1;
			if(c.tick >= c.tickCap)
			{
				c.tick = 0;
				c.frameIndex += 1;
				if(c.frameIndex >= c.frameCap)
				{
					c.frameIndex = 0;
				}
			}
		}

		//Detect collsions between projectile and enemy
		//Get the enemies position
		var enemyPos = app.main.enemy.findEnemy();
		//For each projectile
		for(var i = 0; i < projectiles.length; i++)
		{
			var enemyWidth =  enemyPos.x + 110;
			var enemyHeight = enemyPos.y + 110;
			var projWidth = projectiles[i].pos.x;
			var projHeight = projectiles[i].pos.y;
			//Check for collision
			if(projectiles[i].pos.x >= enemyPos.x && projWidth < enemyWidth && projectiles[i].pos.y >= enemyPos.y && projHeight < enemyHeight)
			{
				//Decrease enemy health and remove projectile
				app.main.enemy.setEnemyHealth(10);
				createjs.Sound.play("impact");
				projectiles.splice(i, 1);
			}
		}
	}

	function fireProjectile(x, y)
	{
		if(canFire && spriteState != SPRITE_STATE.JUMPING && spriteState != SPRITE_STATE.CROUCHING)
		{
			var projectile = {};
			projectile.pos = new Victor(player.pos.x, player.pos.y);
			projectile.vel = new Victor(x - player.pos.x, y - player.pos.y);
			projectile.speed = fireSpeed;

			// recalculate speed;
			projectile.vel.normalize();
			projectile.vel.multiplyScalar(projectile.speed);

			// sprite animation variables
			projectile.frameX = 465;
			projectile.frameY = 704;
			projectile.frameWidth = 34;
			projectile.frameHeight = 34;
			projectile.frameIndex = 0;
			projectile.frameCap = 4;
			projectile.tick = 0;
			projectile.tickCap = 4;

			Object.seal(projectile);
			projectiles.push(projectile);
			canFire = false;
			createjs.Sound.play("batarang");
			// spriteState = SPRITE_STATE.THROWING;
		}
	}

	function setLevel(level)
	{
		fireCap = (level * 5);
	}

	  return{
		  	createPlayer: createPlayer,
		  	drawPlayer: drawPlayer,
		  	handlePlayer: handlePlayer,
		  	handleCollisions: handleCollisions,
		  	findPlayer: findPlayer,
			handleProjectiles: handleProjectiles,
			findPlayerHealth: findPlayerHealth,
			setPlayerHealth: setPlayerHealth,
			fireProjectile: fireProjectile,
			setLevel: setLevel,
			isOver: isOver,
	  };

}());
