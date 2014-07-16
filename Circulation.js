var figures=(function(){
	function createSquare(point,r) {
		var path=new Path();
		path.add(new Point(point.x-r/2,point.y-r/2));
		path.add(new Point(point.x+r/2,point.y-r/2));
		path.add(new Point(point.x+r/2,point.y+r/2));
		path.add(new Point(point.x-r/2,point.y+r/2));
		path.closed=true;
		path.fillColor=raster.getAverageColor(path);
		return path;
	}
	function createCircle(point,r) {
		var circle=new Path.Circle(point, r);
		circle.fillColor=raster.getAverageColor(circle);
		return circle;
	}
	function createRhomb(point,r) {
		var path=new Path();
		path.add(new Point(point.x,point.y-r)); //Top
		path.add(new Point(point.x+r,point.y)); //Right
		path.add(new Point(point.x,point.y+r)); //Bottom
		path.add(new Point(point.x-r,point.y)); //Left
		path.closed=true;
		path.fillColor=raster.getAverageColor(path);
		return path;
	}
	var types={
		'Circle': 'createCircle'
		,'Rhomb': 'createRhomb'
		//,'Square': 'createSquare'
	};
	return {
		'types':types,
		'createCircle': createCircle
		,'createRhomb': createRhomb
		//',createSquare': createSquare
	};
})();

var figureTypesList=[];
for(var i in figures.types) {
	figureTypesList.push(i);
}
var figureType=figureTypesList[0];
var raster;
var groups=[];
var layers=[];
var maxRadius;
var finalizeFlag=false;
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
function onMouseDown(event) {
	var itemBounds;
	var itemRadius;
	var figureCenter;
	var figureRadius;
	var figure;
	var groupIndex

	if(!event.item||!event.item.bounds||!event.item.bounds) return;

	if(!raster) {
		initRaster();
	}

	if(!finalizeFlag) {
		itemBounds=event.item.bounds;
			
		if(event.item instanceof Raster) {
			itemRadius=itemBounds.center.getDistance(itemBounds.bottomRight);
			figureRadius=itemRadius;
			figureCenter=itemBounds.center;
			groupIndex=0;
			if(!maxRadius) maxRadius=itemRadius;
		}
		else if(event.item instanceof Path) {
			itemRadius=itemBounds.width/2;
			var pointVector=(event.point-itemBounds.center).normalize();
			figureRadius=itemRadius/2;
			figureCenter=itemBounds.center+pointVector*itemRadius/2;
			groupIndex=Math.round(maxRadius/itemRadius);
		}
		else {return;}
		
		figure=figures[figures.types[figureType]](figureCenter,figureRadius);

		if(!layers[groupIndex]) {
			layers[groupIndex]=new Layer();
			layers[groupIndex].moveAbove(document.layers[0]);
		}
		layers[groupIndex].appendTop(figure);
	}
	else {
		figure=figures[figures.types[figureType]](event.point,2);
		layers[layers.length-1].appendTop(figure);
	}
}

function onMouseMove(event) {
	onMouseDown(event);
}

//Create UI
function onFigureTypeChange(value) {
	figureType=value;
}
function onClearClick() {
	for(var i=0;i<layers.length;i++) {
		if(layers[i]) layers[i].remove();
	}
	layers=[];
}

var components={
	figureType: {
		type: 'list', label: 'Choose figure',
		value: figureType,
		options: figureTypesList,
		onChange: onFigureTypeChange
	},
	finalizeButton: {
		type: 'boolean', label: 'Finalize',
		value: false,
		onChange: function(value) {
			finalizeFlag=value;
		}
	},
	clearButton: {
		type: 'button', value: 'Clear',
		onClick: onClearClick
	}
}

var palette=new Palette('Circulation Settings',components);

