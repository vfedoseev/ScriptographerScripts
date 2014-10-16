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
function processRaster(raster) {
	var wNum=100,hNum=100;
	var p0=p=raster.bounds.topLeft;
	var w=raster.bounds.width, h=raster.bounds.height;
	var deltaX=w/wNum, deltaY=h/hNum;
	var deltaYP=new Point(0,deltaY);
	var avgColor;
	var path;
	for(var i=0;i<=wNum;i++) {
		path=new Path();
		path.color='#000000';
		for(var j=0;j<=hNum;j++) {
			avgColor=getAverageColor(raster.getAverageColor(p));
			var dark=1-avgColor;
			var l=(deltaX)*dark;
			path.add(p-new Point(l/2,2)); 
			path.insert(0,p+new Point(l/2,0));
			p+=deltaYP;
		}
		path.closed=true;
		//path.smooth();
		p=new Point(p0.x+(i+1)*deltaX,p0.y);
	}
} 

function getAverageColor(color) {
	var c=color.convert('rgb');
	return (c.red+c.green+c.blue)/3;
}


//Init Raster
initRaster();
processRaster(raster);