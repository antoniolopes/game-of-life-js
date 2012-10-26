const DIM = 64;
const POINTER_COLOR = "#ddd";
const LINE_COLOR = "#ddd";
const SEL_COLOR = "#333";
const LINE_WIDTH = 1;
const MARGIN = 1;
const GAME_DELAY = 100;
const TUNE = ['A', 'B', 'C', 'D', 'E'];

var canvas;
var canvas_element;
var curr_coord = null;
var running = false;
var world;
var looper;
var generation = 0;

$(document).ready(function() {
	canvas = $('canvas');
	canvas_element = document.getElementById("gol");

	world = initWorld();

	loadMouseMoveEvent();
	loadMouseClickEvent();

	$('#reset').click(resetGame);
	$('#start').click(startGame);
	$('#stop').click(stopGame);
	$('#random').click(randomGame);
});

function initWorld(){
	w = new Array(DIM);
	for (var i = 0; i != w.length; i++) {
		w[i] = new Array(DIM);
		for(var j = 0; j != w[i].length;j++)
			w[i][j] = 0;
	}
	return w;
}

function updateGeneration(value){
	generation = value;
	$('#value').html(generation);
}

function increaseGeneration(){
	generation++;
	updateGeneration(generation);
}

function startGame(){
	running = true;
	looper = setInterval(loop, GAME_DELAY);
}

function loop(){
	var new_world = initWorld();
	for (var i = 0; i != world.length; i++) {
		for(var j = 0; j != world[i].length;j++){
			var nr_neigbors = getNumberOfLiveNeighbors(j, i);
			if(world[j][i] == 1){ // Live Cell
				nr_neigbors--;
				// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
				// Any live cell with two or three live neighbours lives on to the next generation.
				// Any live cell with more than three live neighbours dies, as if by overcrowding.
				if(nr_neigbors < 2 || nr_neigbors > 3)
					new_world[j][i] = 0;
				else
					new_world[j][i] = 1;
			} else{ // Dead Cell
				// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
				if(nr_neigbors == 3)
					new_world[j][i] = 1;
			}
		}
	}
	world = new_world;
	increaseGeneration();
	drawGame();
}

function getNumberOfLiveNeighbors(i, j){
	var nr_neigbors = 0;
	for (var k = -1; k <= 1; k++)
		for(var l = -1; l <= 1; l++)
			if(isValidPosition(i+k, j+l) && world[i+k][j+l] == 1)
				nr_neigbors++;
	return nr_neigbors;
}

function isValidPosition(i, j){
	return i >= 0 && i < DIM && j >= 0 && j < DIM;
}

function stopGame(){
	running = false;
	clearInterval(looper);
}

function resetGame(){
	world = initWorld();
	stopGame();
	updateGeneration(0);
	drawGame();
}

function randomGame(){
	resetGame();
	for(var i=0; i != DIM;i++){
		for(var j = 0; j != DIM; j++){
			var prob = Math.random() * 5;
			if(prob > 0 && prob <= 1)
				world[i][j] = 1;
		}
	}
	drawGame();
}

function drawGame(){
	canvas.clearCanvas();
	//drawHorizontalLines();
	//drawVerticalLines();
	drawMouseOver();
	drawCells();
}

function drawCells(){
	for (var i = 0; i < world.length; i++)
		for (var j = 0; j < world[i].length; j++)
			if(world[i][j] == 1)
				drawCell(i, j);
}

function map(value, in_min, in_max, out_min, out_max) {
	var div = (in_max - in_min);
	if (div == 0)
		div = 1;
	return ((value - in_min) * (out_max - out_min) / div) + out_min;
}

function drawCell(row, col){
	// Randomly determine cell's color
	// var color_r = Math.round(Math.random() * (256-128) + 128);
	// var color_g = Math.round(Math.random() * (256-128) + 128);
	// var color_b = Math.round(Math.random() * (256-128) + 128);

	// Determine cell's color based on position (degradé)
	var color_r = map(row, 0, DIM, 128, 192);
	var color_g = map(col, 0, DIM, 128, 192);
	var color_b = (color_r > color_g) ? color_r - color_g : color_g - color_r;
	canvas.drawRect({
  		//fillStyle: SEL_COLOR,
  		fillStyle: "rgba(" + color_r + ", " + color_g + ", " + color_b + ", " + 1 + ")",
  		x: row * (canvas.width() / DIM) + MARGIN,
  		y: col * (canvas.height() / DIM) + MARGIN,
  		width: canvas.width() / DIM - MARGIN,
  		height: canvas.height() / DIM - MARGIN,
  		cornerRadius: 2,
  		fromCenter: false
	});
}

function drawMouseOver(){
	if(curr_coord != null && !running)
		canvas.drawRect({
	  		fillStyle: POINTER_COLOR,
	  		x: Math.floor(curr_coord.x * DIM/canvas.width()) * (canvas.width() / DIM),
	  		y: Math.floor(curr_coord.y * DIM/canvas.height()) * (canvas.height() / DIM),
	  		width: canvas.width() / DIM,
	  		height: canvas.height() / DIM,
	  		fromCenter: false
		});
}

function loadMouseMoveEvent(){
	canvas.mousemove(function(event) {
		curr_coord = getActualCoordinates(event);
		drawGame();
  	});
  	canvas.mouseout(function(event){
  		curr_coord = null;
  		drawGame();
  	});
}

function loadMouseClickEvent(){
	canvas.click(function(event){
		if(!running){
			var coord = getActualCoordinates(event);
			var i = Math.floor(coord.x * DIM/canvas.width());
			var j = Math.floor(coord.y * DIM/canvas.height());
			if(world[i][j] == 1)
				world[i][j] = 0;
			else
				world[i][j] = 1;
			drawGame();
		}
	});
}

function getActualCoordinates(e){
	// Get the actual x and y of the canvas position
	var x;
	var y;
	if (e.pageX || e.pageY) { 
		x = e.pageX;
		y = e.pageY;
	} else { 
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	x -= canvas_element.offsetLeft;
	y -= canvas_element.offsetTop;

	return {"x": x, "y": y};
}

function drawHorizontalLines(){
	for (var i = 1; i != DIM; i++)
	canvas.drawLine({
		strokeStyle: LINE_COLOR,
		strokeWidth: LINE_WIDTH,
		x1: 0,
		y1: i * canvas.height()/ DIM,
		x2: canvas.width(),
		y2: i * canvas.height()/ DIM
	});
}

function drawVerticalLines(){
	for (var i = 1; i != DIM; i++)
		canvas.drawLine({
			strokeStyle: LINE_COLOR,
			strokeWidth: LINE_WIDTH,
			x1: canvas.width() * i/DIM,
			y1: 0,
			x2: canvas.width() * i/DIM,
			y2: canvas.height()
		});
}