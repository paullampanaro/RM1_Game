"use strict";

var app = app || {};

app.enemy = (function(){

	var enemy = {};
	var enemyImage; 

	var projectiles = [];
	var fireTimer = 0;
	var canFire = true;
	var fireAlt = false;

	// enemy sprite variables
	var frameWidth = 110;
	var frameHeight = 110;
	
	// sprite animation variables
	var frameX = 570;
	var frameY = 420;
	var spriteWidth = 110;
	var spriteHeight = 110;
	var frameIndex = 0;
	var frameCap = 1;

	var randomTarget = undefined;
	var faceRight = true;

	// alternate attack variables
	var altWeapon = undefined;

	// game level variables
	var laserSpeed = 5;
	var fireCap = 60; //
	var enemyHealth = 10; //
	var laserDamage = 1; //
	var enemySpeed = 0.2; // 
	var enemyMaxSpeed = 5; //
	var bloodlust = 0.5; 

	var dead = false;
	var useSpecial = false;

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
		enemyImage = app.queue.getResult("supermanImage");
		projectiles = [];
		spriteState = SPRITE_STATE.IDLE;
		randomTarget = new Victor(Math.random() * app.main.canvas.width, Math.random() * app.main.canvas.height);

		enemy.pos = new Victor (app.main.canvas.width/2, app.main.canvas.height - frameHeight - 600 );
		enemy.vel = new Victor(0,0);
		enemy.acc = new Victor(0,0);
		enemy.speed = enemySpeed;
		enemy.maxSpeed = enemyMaxSpeed;
		enemy.health = enemyHealth;

		Object.seal(enemy);

		altWeapon = new app.Emitter(); 
		console.log("Emitter created");
		altWeapon.numParticles = 100;
		altWeapon.red = 30;
		altWeapon.green = 144;
		altWeapon.blue = 255;
		altWeapon.createParticles({x: app.main.canvas.width/2  + (frameWidth/2), y: app.main.canvas.height - frameHeight - 500 + (frameHeight/2)});

		Object.seal(altWeapon);
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

		var col = frameX + (spriteWidth * frameIndex); //680
		var row = frameY; //530

		if(faceRight)
			ctx.drawImage(enemyImage,
				col, row, frameWidth, frameHeight,
				enemy.pos.x, enemy.pos.y, 80, 80);
		else
		{
			ctx.save();
			ctx.translate(enemy.pos.x + frameWidth, enemy.pos.y);
			ctx.scale(-1, 1);
			ctx.drawImage(enemyImage,
				frameX, frameY, frameWidth, frameHeight,
				0, 0, 80, 80);
			ctx.restore();
		}

		// always update breath, don't always draw
		altWeapon.update({x: enemy.pos.x  + (frameWidth - 15), y: enemy.pos.y + (30)});

		if(fireAlt)
			altWeapon.draw(ctx);
		}

		function handleEnemy()
		{
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_I])
			{
				console.log("cheese");
				useSpecial = !useSpecial;
			}

			var rando = Math.random();

			enemy.acc = new Victor(randomTarget.x - enemy.pos.x, randomTarget.y - enemy.pos.y);
			enemy.acc.normalize();
			enemy.acc.multiplyScalar(enemy.speed);
			enemy.vel.add(enemy.acc);

			if(enemy.vel.magnitude() > enemy.maxSpeed)
			{
				enemy.vel.normalize();
				enemy.vel.multiplyScalar(enemy.maxSpeed);
			}

			enemy.pos.add(enemy.vel);

			if(!dead)
			{
				if(enemy.vel.x < 0)
					faceRight = false;
				else
					faceRight = true;
			}

			if(enemy.pos.distance(randomTarget) < 100)
			{
				if(rando > bloodlust)
					randomTarget = new Victor(Math.random() * app.main.canvas.width, Math.random() * app.main.canvas.height);
				else
					randomTarget = app.main.player.findPlayer();
			}

			if(enemy.health <= 0)
			{
				dead = true;
				spriteState = SPRITE_STATE.DYING;
			}

			if(dead)
			{
				randomTarget = new Victor(Math.random() * app.main.canvas.width, app.main.canvas.height * 2);
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
				frameX = 570;
				frameY = 420;
				frameCap = 1;
				spriteWidth = 110;
				spriteHeight = 110;
			}

			if(spriteState == SPRITE_STATE.DYING)
			{
				frameX = 100;
				frameY = 780;
				frameCap = 1;
				spriteWidth = 120;
				spriteHeight = 125;
			}
		}

		//Getter for enemy health
		function findEnemyHealth()
		{
			return enemy.health;
		}

		//Setter for enemy health
		function setEnemyHealth(newHealth)
		{
			enemy.health -= newHealth;
		}

		//Getter for eney position
		function findEnemy()
		{
			return enemy.pos;
		}

		function handleProjectiles(ctx)
		{
			var playerPos = app.main.player.findPlayer();
			var enemyPos = new Victor(enemy.pos.x + (frameWidth - 15), enemy.pos.y + 30);
			fireTimer += 1;
			if(fireTimer >= fireCap)
			{
				fireTimer = 0;
				canFire = true;
			}

			var fireProjectile = function()
			{
				var length;

				if(useSpecial)
				{
					createjs.Sound.play("laserSpecial");
					length = 100;
				}
				else
				{
					createjs.Sound.play("laser");
					length = 20;
				}

				var projectile = {};
				projectile.pos = enemyPos;
				projectile.vel = new Victor(playerPos.x - enemyPos.x, playerPos.y - enemyPos.y);
				projectile.speed = laserSpeed;

				// recalculate speed;
				projectile.vel.normalize();
				projectile.vel.multiplyScalar(projectile.speed);

				// add tracer victor to draw
				projectile.tracer = new Victor(projectile.vel.x, projectile.vel.y);
				projectile.tracer.multiplyScalar(length);

				Object.seal(projectile);
				projectiles.push(projectile);
				canFire = false;
			}

			if(enemyPos.distance(playerPos) < 500 && !dead)
			{
				if(enemyPos.distance(playerPos) < 200)
				{
					if(!fireAlt)
					{
						createjs.Sound.play("breath");
					}
					fireAlt = true;
					app.main.player.setPlayerHealth(1);
				}
				else
				{
					fireAlt = false;
					if(canFire)
					{
						fireProjectile();
					}
				}
			}

			for(var i = 0; i < projectiles.length; i++)
			{
				var c = projectiles[i];

				if(c.pos.x > app.main.canvas.width || c.pos.y > app.main.height || c.pos.x < 0 || c.pos.y < 0)
				{
					projectiles.splice(i, 1);
				}

				c.pos.add(c.vel);

				var width;

				if(useSpecial)
					width = 40;
				else
					width = 5;

				ctx.save();
				ctx.strokeStyle = "red";
				ctx.lineWidth = width;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(c.pos.x - (c.tracer.x/2), c.pos.y - (c.tracer.y/2));
				ctx.lineTo(c.pos.x + (c.tracer.x/2), c.pos.y + (c.tracer.y/2));
				// ctx.closePath();
				ctx.stroke();
				ctx.restore();
			}

			//Check for collisions with player
			for(var i = 0; i < projectiles.length; i++)
			{
				var playerWidth =  playerPos.x + 70;
				var playerHeight = playerPos.y + 70;
				var projWidth = projectiles[i].pos.x;
				var projHeight = projectiles[i].pos.y;
				
				//If they are colliding
				if(projectiles[i].pos.x >= playerPos.x && projWidth < playerWidth && projectiles[i].pos.y >= playerPos.y && projHeight < playerHeight)
				{
					//Lower the player's health and remove the projectile
					app.main.player.setPlayerHealth(laserDamage);
					createjs.Sound.play("hit");
					projectiles.splice(i, 1);
				}
			}
		}

		function setLevel(level)
		{
			dead = false;
			// game level variables
			// laserSpeed = 1 + level;
			fireCap = 60 - (level * 5); //
			enemyHealth = 50 + (level * 10); //
			laserDamage = 1 + level; //
			// enemySpeed = 0.1 + (level * 0.1); // 
			// enemyMaxSpeed = 1 + level; // 
			bloodlust = level * 0.1;

			if(fireCap <= 0)
			{
				fireCap = 1;
			}
		}

		return{
			createEnemy: createEnemy,
			drawEnemy: drawEnemy,
			handleEnemy: handleEnemy,
			handleProjectiles: handleProjectiles, // temporary, move this
			findEnemyHealth: findEnemyHealth,
			setEnemyHealth: setEnemyHealth,
			findEnemy: findEnemy,
			setLevel: setLevel,
		};

	}());
