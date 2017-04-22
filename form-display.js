var id=0;
var squares = [ ];
var currentSquare = null;
var currentStep = 0;

var sqSize = 60;
var offset = 15;

var SIDE = {
	LEFT:  {value: 0, name: "Flat",  code: "L"}, 
	RIGHT: {value: 1, name: "Right", code: "R"}, 
	fromCode: function(c) {
		switch (c)
		{
			case SIDE.LEFT.code:   return SIDE.LEFT;
		  	case SIDE.RIGHT.code:  return SIDE.RIGHT;
		} 
		return SIDE.LEFT;
	}
}
var TYPE = {
	FLAT:         {value: 0, name: "Flat",          code: ""}, 
	HANGING_TOE:  {value: 1, name: "Hanging Toe",  code: "T"}, 
	HANGING_HEAL: {value: 2, name: "Hanging Heal", code: "H"}, 
	FLOATING :    {value: 3, name: "Floating",     code: "F"}, 
	fromCode: function(c) {
		switch (c)
		{
			case TYPE.FLAT.code:         return TYPE.FLAT;
			case TYPE.HANGING_TOE.code:  return TYPE.HANGING_TOE;
			case TYPE.HANGING_HEAL.code: return TYPE.HANGING_HEAL;
			case TYPE.FLOATING.code:     return TYPE.FLOATING;
		} 
		return TYPE.FLAT;
	}
};

var DIR = {
	NONE:      {value: 0, name: "None",      code: "",   offX:  0, offY:  0, dir:   0},
	NORTH:     {value: 1, name: "North",     code: "N",  offX:  0, offY: -1, dir:   0},
	NORTHEAST: {value: 2, name: "NorthEast", code: "NE", offX:  1, offY: -1, dir:  45},
	EAST:      {value: 3, name: "East",      code: "E",  offX:  1, offY:  0, dir:  90},
	SOUTHEAST: {value: 4, name: "SouthEast", code: "SE", offX:  1, offY:  1, dir: 135},
	SOUTH:     {value: 5, name: "South",     code: "S",  offX:  0, offY:  1, dir: 180},
	SOUTHWEST: {value: 6, name: "SouthWest", code: "SW", offX: -1, offY:  1, dir: 225},
	WEST:      {value: 7, name: "West",      code: "W",  offX: -1, offY:  0, dir: 270},
	NORTHWEST: {value: 8, name: "NorthWest", code: "NW", offX: -1, offY: -1, dir: 315}, 
	fromCode: function(c) {
		switch (c)
		{
			case DIR.NORTH.code:     return DIR.NORTH;
			case DIR.NORTHEAST.code: return DIR.NORTHEAST;
			case DIR.EAST.code:      return DIR.EAST;
			case DIR.SOUTHEAST.code: return DIR.SOUTHEAST;
			case DIR.SOUTH.code:     return DIR.SOUTH;
			case DIR.SOUTHWEST.code: return DIR.SOUTHWEST;
			case DIR.WEST.code:      return DIR.WEST;
			case DIR.NORTHWEST.code: return DIR.NORTHWEST;
		} 
		return DIR.NONE;
	}
};


function copySquare(sqr)
{
	return jQuery.extend({}, sqr);
}

/**
 * Foot String
 * Corner:DirectionPointing:Type
 * Corner:  in { N,E,S,W }
 * DirectionPointing:  in { N,NE,E,SE,S,SW,W,NW,"" }
 * Type:(optional == "") in { F,T,H,"" } 
 * Distance: (optional == 1) in { 1,0.5,2 ...}
 */
function newFoot(str, side)
{
	var arr = str.split(":");
	var corner = DIR.fromCode(arr[0]);
	var dp = DIR.fromCode(arr[1]);
	var type = (arr.length>2) ? TYPE.fromCode(arr[2]) : TYPE.FLAT;
	var foot = {
		x: corner.offX,
		y: corner.offY,
		d: dp,
		t: type,
		s: side
	}
	return foot;
}

function copyFoot(foot)
{
	return jQuery.extend({}, foot);
}
/**
 * Foot String
 * DirectionMoved:DirectionPointing:Type:DistanceMoved
 * DirectionMoved:   in { N,NE,E,SE,S,SW,W,NW,"" }
 * DirectionPointing:  in { N,NE,E,SE,S,SW,W,NW }
 * Type:(optional == "") in { F,T,H,"" } 
 * Distance: (optional == 1) in { 0,0.5,1,1.5,2 ...}
 */
function moveFoot(foot, move)
{
	if (move == null) return copyFoot(foot);

	var arr = move.split(":");
	var dirMoved = DIR.fromCode(arr[0]);
	var dp = (arr.length>1) ? DIR.fromCode(arr[1]) : DIR.NORTH;
	var type = (arr.length>2) ? TYPE.fromCode(arr[2]) : TYPE.FLAT;
	var dist = (arr.length>3) ? arr[3] : 1;
	var newFoot = copyFoot(foot);
	if (dirMoved != DIR.NONE)
	{
		newFoot.x = foot.x +dirMoved.offX*dist;
		newFoot.y = foot.y +dirMoved.offY*dist;
	}
	newFoot.d = dp;
	newFoot.t = type;
	return newFoot;
}

function updateCorners(sqr)
{
	var minX = Math.min(sqr.left.x, sqr.right.x);
	var minY = Math.min(sqr.left.y, sqr.right.y);
	var maxX = Math.max(sqr.left.x, sqr.right.x);
	var maxY = Math.max(sqr.left.y, sqr.right.y);

	if (minX == maxX) maxX+=1;
	if (minY == maxY) minY-=1;
	sqr.x = minX;
	sqr.y = minY;
	sqr.sz = { x: maxX-minX, y: maxY-minY };
	//sqr.label = "@("+minX+","+minY+") ["+sqr.sz.x+","+sqr.sz.y+"]";
	sqr.label = "@("+minX+","+minY+")";
}

/* Example
 * 
 * step({ name: "Opening the form", face: "N", left:"SW:N", right:"SW:N", desc: "Wu Chi"});
 * step({ right: "SE:N", desc: "Tai Chi" });
 * step({ name: "Grasp the sparrows tail" );
 * step("", "0", "SW:N", "SE:NE", "Hanging 1");
 * step("", "0", "SW:N", "SE:NE", "Hanging 2");
 */

function step(obj)
{
	var newSquare;
	if (currentSquare == null)
	{

		newSquare = {"id": 0, "x": 0, "y": 0, "left": null, "right": null, label: "@(0,0) [1,1]"};
		newSquare.left = newFoot(obj.leftStart, SIDE.LEFT);
		newSquare.right = newFoot(obj.rightStart, SIDE.RIGHT);
	}
	else
	{
		newSquare = copySquare(currentSquare);
		newSquare.left = moveFoot(currentSquare.left, obj.left);
		newSquare.right = moveFoot(currentSquare.right, obj.right);
	}

	if (obj.name != null) newSquare.name = obj.name;
	newSquare.desc = obj.desc;

	updateCorners(newSquare);
	squares.push(newSquare);
	currentSquare = newSquare;
}

function displayAll()
{
	var fullSteps= [ ];
	$("#contents").html("");
	$("#contents").append("<div id='buttons' style='clear: both;'>" +
			"<button class='button' id='showStep'>Show Single Step</button>"+
			"<button class='button' id='showSummary'>Show Summary</button>"+
			"</div>");
	$("#showStep").click(function() { displayStep(); });
	$("#showSummary").click(function() { displaySummary(); });

	var title = "";
	for (var i=0; i<squares.length; i++)
	{
		var s = squares[i];
		var id = "lform_"+i;

		if (title != s.name)
			$("#contents").append("<div  style='clear: both;'><h3 class='title'>"+s.name+"</h3></div>");
		
		console.log("Label: "+s.label + " L:["+s.left.x+","+s.left.y+"] R:"+s.right.x+","+s.right.y+"]");
		
		$("#contents").append("<div style='float: left;' id='"+id+"'></div>");
		$("#"+id).append("<div ><div class='desc'>&nbsp;</div><div class='svg'></div></div>");
		showStep(id, i, "ALL");
		title = s.name;
	}
}

function displaySummary()
{
	var fullSteps= [ ];
	$("#contents").html("");
	$("#contents").append("<div id='buttons' style='clear: both;'>" +
			"<button class='button' id='showStep'>Show Single Step</button>"+
			"<button class='button' id='showAll'>Show All</button>"+
			"</div>");
	$("#showStep").click(function() { displayStep(); });
	$("#showAll").click(function() { displayAll(); });

	var title = "";
	var label = "";
	for (var i=0; i<squares.length; i++)
	{
		var s = squares[i];
		var id = "lform_"+i;

		if (title != s.name)
			$("#contents").append("<div  style='clear: both;'><h3 class='title'>"+s.name+"</h3></div>");
		
		console.log("Label: "+s.label + " L:["+s.left.x+","+s.left.y+"] R:"+s.right.x+","+s.right.y+"]");
		if (label != s.label)
		{
			fullSteps.push(i);
			if (fullSteps.length>5) fullSteps.shift();
			console.log("Steps: "+ JSON.stringify(fullSteps));
		}
		$("#contents").append("<div style='float: left;' id='"+id+"'></div>");
		$("#"+id).append("<div ><div class='desc'>&nbsp;</div><div class='svg'></div></div>");
		var lastStep = fullSteps[0];
		showStep(id, i, lastStep);
		title = s.name;
		label = s.label;
	}
}

function displayStep()
{
	$("#contents").html("");
	var id = "single";
	$("#contents").append("<div id='"+id+"'><div  style='clear: both;'><h3 class='title'>&nbsp;</h3></div></div>");
	$("#"+id).append("<div style='float: left bottom;'><div class='desc'>&nbsp;</div><div class='svg'></div></div>");
	

	$("#"+id).append("<div id='buttons' style='clear: both;'>" +
		"<button class='button' id='prevStep'>Previous</button>"+
		"<button class='button' id='nextStep'>Next</button>"+
		"<button class='button' id='runAll'>Run</button>"+
		"<button class='button' id='showAll'>Show All</button>"+
		"<button class='button' id='showSummary'>Show Summary</button>"+
		"</div>");
	$("#prevStep").click(function() { showStep(id, currentStep-1, "ALL"); });
	$("#nextStep").click(function() { showStep(id, currentStep+1, "ALL"); });
	$("#runAll").click(function() { runAll(0); });
	$("#showAll").click(function() { displayAll(); });
	$("#showSummary").click(function() { displaySummary(); });
	
	showStep(id, 0, "ALL");
}

function runAll(step)
{
	if (step<0) return;
	if (step>=squares.length) return;
	setTimeout(function() { runAll(step+1); }, 1000);
	showStep("single", step, "ALL");
}

function showStep(id, step, showAll)
{
	if (step<0) return;
	if (step>=squares.length) return;
	currentStep = step;

	$("#"+id+" div.svg").removeClass("hasSVG").html("");
	$("#"+id+" div.svg").svg({onLoad: function(svg) { drawIntro(svg, id, step, showAll); } });
}

function addBoundingRect(svg, x, y, szX, szY, style)
{
	svg.rect((x)*sqSize, (y)*sqSize, (szX)*sqSize+2*offset, (szY)*sqSize+2*offset, style);
}

function addSquare(svg, sqr, origin, style)
{
	var x=sqr.x-origin.x;
	var y=sqr.y-origin.y;
	svg.rect(offset+x*sqSize, offset+(y)*sqSize, sqr.sz.x*sqSize, sqr.sz.y*sqSize, style);
}


function t(point, origin, border, scale)
{
	var np = { 
		x: border+(point.x-origin.x)*scale,
		y: border+(point.y-origin.y)*scale
	};
	return np;

}
function addFoot(svg, f, origin, style)
{	
	var c = t(f, origin, offset, sqSize);
	var s = jQuery.extend({}, style);
	var deg = f.d.dir;

	var s_h = jQuery.extend({}, style);
	var s_t = jQuery.extend({}, style);
	var side = (f.s == SIDE.LEFT) ? -3 : 3;

	if (f.t == TYPE.HANGING_TOE)  s_h.fill="transparent";
	if (f.t == TYPE.HANGING_HEAL) s_t.fill="transparent";

	if (f.t != TYPE.FLOATING)
	{
		s_h.transform="translate("+c.x+" "+c.y+") rotate("+deg+") translate("+side+"  3)";
		s_t.transform="translate("+c.x+" "+c.y+") rotate("+deg+") translate("+side+"-3)";
		svg.ellipse('','', 2, 3, s_h);
		svg.ellipse('','', 2, 3, s_t);
	}
}

function addLine(svg, origin, l, r, style)
{
	var tL = t(l, origin, offset, sqSize);
	var tR = t(r, origin, offset, sqSize);

	if (l.t != TYPE.FLOATING && r.t != TYPE.FLOATING)
		svg.line(tL.x, tL.y, tR.x, tR.y, style);
	
	addFoot(svg, l, origin, style);
	var s = jQuery.extend({}, style);
	s.fill=s.stroke="blue";
	addFoot(svg, r, origin, s);
}

function drawIntro(svg, id, step, drawFrom ) { 
	var min = { "x": null, "y": null};
	var max = { "x": null, "y": null};

	var drawTo = (drawFrom=="ALL") ? squares.length : step+1;
	drawFrom = (drawFrom=="ALL") ? 0 : drawFrom;
	for (var i=drawFrom; i<drawTo; i++)
	{
		var cs = squares[i];
		if (min.x==null || min.x>cs.x) min.x=cs.x;
		if (min.y==null || min.y>cs.y) min.y=cs.y;
		if (max.x==null || max.x<cs.x) max.x=cs.x;
		if (max.y==null || max.y<cs.y) max.y=cs.y;
	}
	max.x=max.x+1;
	max.y=max.y+1;

	addBoundingRect(svg, 0, 0, max.x-min.x, max.y-min.y, {fill: 'none', stroke: 'blue', strokeWidth: 1});

	for (var i=drawFrom; i<drawTo-1; i++)
	{
		var cs = squares[i];
		addSquare(svg, cs, min, {fill: 'lightgray', stroke: 'transparent', strokeWidth: 1});
	}

	for (var i=drawFrom; i<drawTo-1; i++)
	{
		var cs = squares[i];
		addSquare(svg, cs, min, {fill: 'transparent', stroke: 'darkgray', strokeWidth: 1});
	}

	var s = squares[step];
	addSquare(svg, s, min, {fill: 'lightgreen', stroke: 'darkgray', strokeWidth: 1});

	addLine(svg, min, s.left, s.right,	{fill: 'red', stroke: 'red', strokeWidth: 1})
	$("#"+id+" div.svg svg").css({"height": (max.y-min.y)*sqSize+2*offset, "width": (max.x-min.x)*sqSize+2*offset});
	$("#"+id).css({ "width": (max.x-min.x)*sqSize+2*offset});

	$("#"+id+" .title").html((s.name==null) ? "&nbsp;" : s.name);
	$("#"+id+" .desc").html((s.desc==null) ? "&nbsp;" : s.desc);
}