//Base image for tridrawing
function Base() {
	this.image = null;
	this.bounds = null;
}
Base.prototype.setImage = function(image) {
	this.image = image;
	this.calculateBounds();
};
Base.prototype.calculateBounds = function() {
	this.bounds = this.image.bounds;
}

//Base Triangle
function Triangle(a,b,c,ai,bi,ci) {
	this.a = a;
	this.b = b;
	this.c = c;
	this.pointsIndex = {'a': ai, 'b': bi, 'c': ci};

	this.calculateCircum();
}
Triangle.prototype.calculateCircum = function() {
	var a =this.a;
	var b= this.b; 
	var c = this.c;

	var y23 = b.y - c.y;
	var y31 = c.y - a.y;
	var y12 = a.y - b.y;
	var aa = a.x*y23 + b.x*y31 + c.x*y12;
	var k = a.x*a.x + a.y*a.y;
	var m = b.x*b.x + b.y*b.y;
	var n = c.x*c.x + c.y*c.y;
	var bb = k*y23 + m*y31 + n*y12;
	var cc = k*(b.x - c.x) + m*(c.x - a.x) + n*(a.x - b.x);
	var dd = k*(b.x*c.y - c.x*b.y)+ m*(c.x*a.y - a.x*c.y) + n*(a.x*b.y - b.x*a.y);

	this.circum = {'a': aa, 'b': bb, 'c': cc, 'd': dd}; 
}
Triangle.prototype.isPointInCircum = function(point) {
	var circum = this.circum;
	var r = circum.a*(point.x*point.x+point.y*point.y) - circum.b*point.x + circum.c*point.y -circum.d;
	return (r<=0);
}
//Triangulation object
function Triangulation() {
	this.bounds = null;	
	this.points = [];
	this.triangles = [];

	this.onChange = function() {}
}
Triangulation.prototype.setBounds = function(bounds) {
	this.bounds = bounds;
	var tl = bounds.topLeft;
	var tr = bounds.topRight;
	var bl = bounds.bottomLeft;
	var br = bounds.bottomRight;

	this.points[0] = tl;
	this.points[1] = tr;
	this.points[2] = bl;
	this.points[3] = br;

	//this.triangles.push(new Triangle(tl,tr,bl)); //Add triangle topLeft, topRight, bottomLeft
	//this.triangles.push(new Triangle(bl,tr,br)); //Add triangle bottomLeft, topRight, bottomRight

	this.addTriangle(0,1,2); //Add triangle topLeft, topRight, bottomLeft
	this.addTriangle(2,1,3); //Add triangle bottomLeft, topRight, bottomRight

	this.onChange(this.triangles);
}
Triangulation.prototype.inBounds = function(point) {
	return (point.x>=this.bounds.topLeft.x&&point.x<=this.bounds.bottomRight.x
			&&point.y>=this.bounds.topLeft.y&&point.y<=this.bounds.bottomRight.y);
}
Triangulation.prototype.addPoint = function(point) {
	if(!this.inBounds(point)) return;
	/*var circle = new Path.Circle(point,5);
	circle.strokeColor = "#FF0000";
	circle.fillColor = null;*/
	//this.onChange(this.triangles);

	var currentIndex = this.points.length;
	this.points.push(point);
	var boundPoints = [];

	//Check for the "inCircum"
	for(var i=0;i<this.triangles.length;) {

		var t = this.triangles[i];
		//recolorTriangle(i,'#FF0000');
		if(t.isPointInCircum(point)) {
			//recolorTriangle(i,'#FF0000');
			if(boundPoints.indexOf(t.pointsIndex.a)==-1) boundPoints.push(t.pointsIndex.a);
			if(boundPoints.indexOf(t.pointsIndex.b)==-1) boundPoints.push(t.pointsIndex.b);
			if(boundPoints.indexOf(t.pointsIndex.c)==-1) boundPoints.push(t.pointsIndex.c);

            //Remove triangle 
			this.removeTriangle(i);
		}
		else {
			i++; //go to next traingle
		}
	}

	//Sort boundPoints (indexes) by the angles
	var p0=this.points[currentIndex];
	for(i=0;i<boundPoints.length;i++) {
		var p1 = this.points[boundPoints[i]];
		var v1 = p1 - p0;
		var minAngle = v1.angle;
		for(var j=i+1;j<boundPoints.length;j++) {
			var p2 = this.points[boundPoints[j]];
			var v2 = p2 - p0;
			if(v2.angle<minAngle) {
				minAngle = v2.angle;
				var tempIndex = boundPoints[j];
				boundPoints[j] = boundPoints[i];
				boundPoints[i] = tempIndex;
			}
		}
		
	} 
	//Finally, add all new triangles
	for(i=0;i<boundPoints.length;i++) {
		p1 = this.points[boundPoints[i]];
		var i2 = (i==boundPoints.length-1)?0:(i+1);
		p2 = this.points[boundPoints[i2]];
		this.addTriangle(currentIndex,boundPoints[i],boundPoints[i2]);		
	}
	this.onChange(this.triangles);
}
Triangulation.prototype.addTriangle = function(ai,bi,ci) {
	var a = this.points[ai];
	var b = this.points[bi];
	var c = this.points[ci];
	this.triangles.push(new Triangle(a,b,c,ai,bi,ci));
}
Triangulation.prototype.removeTriangle = function(index) {
	this.triangles.splice(index,1);
}


var init = false;
var base;
var triangulation;

function initialize() {
	var rasters = document.getItems({
		type: Raster,
		selected: true
	});
	if(rasters.length==1) {
		initDrawing(rasters[0]);
	}
	else {
		Dialog.alert("Please select one raster image first!");
	}
}
function initDrawing(image) {
	init=true;
	base = new Base();
	base.setImage(image);	
	triangulation = new Triangulation();
	triangulation.onChange = onTriangulationChange;
	triangulation.setBounds(base.bounds);
}
//Development functions! Check them later!
var graphicTriangles = [];
function onTriangulationChange(triangles) { ///Redraw on triangulation change
	removeAllTriangles();
	var l = triangles.length;
	for(var i=0;i<l;i++) {
		var t = triangles[i];
		graphicTriangles[i] = drawTriangle(triangles[i]);

	}

}
function drawTriangle(triangle) {
	var trianglePath = new Path();
	
	trianglePath.add(triangle.a);
	trianglePath.add(triangle.b);
	trianglePath.add(triangle.c);

	trianglePath.closed = true;

	trianglePath.fillColor = getRasterColor(base.image,trianglePath);
	//trianglePath.opacity = 0.5;
	trianglePath.strokeColor = null;
	trianglePath.strokeWidth = 0;

	return trianglePath;
}
function getRasterColor(raster,path) {
	var color = raster.getAverageColor(path);
	return color;
}
function recolorTriangle(i,color) {
	graphicTriangles[i].strokeColor = color;
} 
function removeAllTriangles() {
	for(var i=0;i<graphicTriangles.length;i++) {
		graphicTriangles[i].remove();
	}
}
//


//MouseEvent Handlers
function onMouseDown(event) {
	if(!init) return;
	if(event.item) {
		//console.log(event.item)
	}
	triangulation.addPoint(event.point);
}


//Init main
initialize();