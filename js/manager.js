// manager for game objects and collisions
"use strict";

var app = app || {};

app.manager = (function(){

	// variables here
	var PLATFORMWIDTH = 200;
  	var PLATFORMHEIGHT = 20;
  	var PLATFORMLEFTX = 100;
  	var PLATFORMRIGHTX = 700;
  	var PLATFORMMIDX = 400;

	var platforms = [];

	var platformImage = new Image();
	platformImage.src = "media/platform.png";

	// functions
	function createPlatforms()
	{
		var createPlatform = function(xPos, yPos)
		{
			var c = {};
			c.x = xPos;
			c.y = yPos;
			c.width = PLATFORMWIDTH;
			c.height = PLATFORMHEIGHT;
			return c;
		}

		/* this.ctx.fillRect(this.PLATFORMLEFTX, 668, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMRIGHTX, 668, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMMIDX, 568, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMLEFTX, 468, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMRIGHTX, 468, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMMIDX, 368, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMLEFTX, 268, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMRIGHTX, 268, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      this.ctx.fillRect(this.PLATFORMMIDX, 168, this.PLATFORMWIDTH, this.PLATFORMHEIGHT);
      */
		var c = createPlatform(PLATFORMLEFTX, 668);
		platforms.push(c);

		c = createPlatform(PLATFORMRIGHTX, 668);
		platforms.push(c);

		c = createPlatform(PLATFORMMIDX, 568);
		platforms.push(c);

		c = createPlatform(PLATFORMLEFTX, 468);
		platforms.push(c);

		c = createPlatform(PLATFORMRIGHTX, 468);
		platforms.push(c);

		c = createPlatform(PLATFORMMIDX, 368);
		platforms.push(c);

		c = createPlatform(PLATFORMLEFTX, 268);
		platforms.push(c);

		c = createPlatform(PLATFORMRIGHTX, 268);
		platforms.push(c);

		c = createPlatform(PLATFORMMIDX, 168);
		platforms.push(c);
	}

	function handlePlatforms(ctx)
	{
		for(var i = 0; i < platforms.length; i++)
		{
			var c = platforms[i];

			ctx.drawImage(platformImage, c.x - 5, c.y - 5, c.width + 5, c.height + 5);
			app.main.player.handleCollisions(c.x, c.y, c.width, c.height);
		}
	}

	return{
		// return methods here
		createPlatforms: createPlatforms,
		handlePlatforms: handlePlatforms,
	};
	
}());