// manager for game objects and collisions
"use strict";

var app = app || {};

app.manager = (function(){

	var player = undefined;

	// Greg
	function createManager(){
		player = new player;
	}

	function drawWorld(ctx){
		ctx.save();
		ctx.fillStyle = "red";
		ctx.fillRect(540, 668, 100, 10);
		ctx.restore();
	}

	return{
		createManager: createManager,
		drawWorld: drawWorld
	};
	
}());