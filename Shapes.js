var deltaAngle=45;
var directionsNumber=8;
var raster;
function initRaster() {
	if(raster==null) {
		var rasters=document.getItems({
			type:Raster,
			selected:true
		});
		if(rasters.length>0) {
			raster=rasters[0];
		}
		else {
			Dialog.alert('Please select raster image!');
			return;
		}
	}
}
function addShape(point) {
	var path=new Path();
	var x=point.x,
		y=point.y;
	var color=raster.getPixel(point).convert('rgb');
	var angle=0;
	var vector=new Point(x+1,y)-point;
	for(var i=0;i<directionsNumber;i++) {
		vector.length=1;
		var j=0;
		do {
			var newColor=raster.getPixel(point+vector).convert('rgb');
			j++;
			var dist=getColorsDistance(newColor,color);
			vector.length++;
		} while(dist<0.01&&vector.length<30);
		path.add(point+vector);
		vector.angle+=deltaAngle;
	}
	path.closed=true;
	path.fillColor=raster.getAverageColor(path);
}
function getColorsDistance(color1,color2) {
	var dist=(color1.red-color2.red)*(color1.red-color2.red)+
			(color1.green-color2.green)*(color1.green-color2.green)+
			(color1.blue-color2.blue)*(color1.blue-color2.blue);
	return dist;
}
function onMouseDown(event) {
	addShape(event.point);
}
function onMouseMove(event) {
	addShape(event.point);
}
initRaster();