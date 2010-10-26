ShapeHover
====

ShapeHover add rollover effect on an image map using canvas or vml. It allows you to make some nices rollover menus with non-rectangular areas and it degrades gracefully in a simple image map if javascript is disabled or if the browser do not support canvas/vml.

![Screenshot](http://github.com/Country/ShapeHover/raw/master/logo.png)

How to use
----------

To use ShapeHover, you need an image with an image map in your HTML. Just call the constructor with the image element as first parameter and the options object as second parameter.

### Example

HTML:

	<img id="myimage" width="40" height="20" usemap="#mymap" alt="My Image" src="myimage.png"/>
	<map name="mymap">
		<area shape="poly" coords="0,0,20,0,20,20,0,20" href="http://www.area-1.com" alt="Area 1"/>
		<area shape="poly" coords="20,00,40,00,40,20,20,20" href="http://www.area-2.com" alt="Area 2"/>
	</map>

CSS:

	img { border:0 }

JavaScript:

	new ShapeHover('myimage', {
		fill: {
			type: 'color',
			content: '#F00'
		},
		stroke: false,
		fade: false,
		onClick: function(e){
			// do stuff
		}
	});

### Notes

 * Your image must not have border
 * If ShapeHover is initialized before the window.onLoad event, you must specify the dimensions of the image in the image element (width/height attributes)