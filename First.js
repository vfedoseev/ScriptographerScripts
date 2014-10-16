var circleConfig = {
	RADIUS: 5,
	COLOR: '#0000FF'
};
function addPointLocator (point) {
	var circle = new Path.Circle(point,circleConfig.RADIUS);
	circle.strokeColor = circleConfig.COLOR;
}

function onMouseDown(event) {
	addPointLocator(event.point);
};