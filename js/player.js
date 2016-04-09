// player object
"use strict";

var app = app || {};

app.player = (function(){

	var player = {};
	var playerImage = new Image();
	playerImage.src = "media/batman.png";

	// sprite animation variables
	var frameWidth = 100;
	var frameHeight = 120;
	var frameDelay = 1;
	var frameIndex = 0;
	var numCols = 10;

	function createPlayer(){

		player.pos = new Victor (app.main.canvas.width/2, app.main.canvas.height - 100);
		player.vel = new Victor(0,0);
		player.acc = new Victor(0,0);
		player.speed = 5;
		player.friction = 0.95;
		player.jump = 0;

		Object.seal(player);
	}

	function drawPlayer(ctx){

		var col = frameIndex % (numCols);
		var row = Math.floor(frameIndex / numCols);
		var frameX = col * frameWidth;
		var frameY = row * frameHeight;

		ctx.drawImage(playerImage, 
			frameX, frameY, frameWidth, frameHeight,
			player.pos.x, player.pos.y, frameWidth, frameHeight);
	}

	function handlePlayer(dt){

	  	// move up using 'w' key
	  	if(myKeys.keydown[myKeys.KEYBOARD.KEY_W]){
	  		if (player.jump < 200){
	  			player.pos.y -= 15;
	  		}
	  		player.jump += 15;
	  	}

    	// move right using 'd' key
    	if(myKeys.keydown[myKeys.KEYBOARD.KEY_D]){
    		player.vel.add(Victor(1,0));

    		handleFrameIndex();
    	}

    	// move left using 'a' key
    	if(myKeys.keydown[myKeys.KEYBOARD.KEY_A]){
    		player.vel.add(Victor(-1,0));
    		
    		handleFrameIndex();
    	}

		// this.player.vel.normalize();
		// this.player.vel.multiplyScalar(this.player.speed);
		player.vel.multiplyScalar(player.friction);
		player.pos.add(player.vel);

		if(player.pos.y < app.main.canvas.height - 100){
			player.pos.y += 6;
		}

		if(player.pos.y >= app.main.canvas.height - 100){
			player.jump = 0;
		}

		if(player.pos.x < 0){
			player.pos.x = 0;
		}
		else if(player.pos.x  >= app.main.canvas.width - 100){
			player.pos.x = app.main.canvas.width - 100;
		}
	}

	function handleFrameIndex()
	{
		// sprite animation
		frameIndex += 1;
		if(frameIndex == 10)
		{
			frameIndex = 0;
		}
	}

  return{
  	createPlayer: createPlayer,
  	drawPlayer: drawPlayer,
  	handlePlayer: handlePlayer
  };

}());