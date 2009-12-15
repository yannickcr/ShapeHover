Class: ShapeHover {#ShapeHover}
=========================================

ShapeHover is a MooTools plugin that add rollover effect on an image map using canvas or vml. It allows you to make some nices rollover menus with non-rectangular areas and it degrades gracefully in a simple image map if javascript is disabled or if the browser do not support canvas/vml.

### Implements:

[Options][options], [Events][events]

ShapeHover Method: constructor {#ShapeHover:constructor}
-------------------------------------------------------------------

### Syntax:

	var shapehover = new ShapeHover(element, options);

### Arguments:

1. element - (mixed) A string of the id for an Element or an Element reference to match his imagemap.
2. options - (object) Options for the class.

### Options:

* fill - (object) The filling styles. Set it to false to disable filling.
  * type - (string: defaults to `color`) The filling type, can be `color` or `image`.
  * content - (string: defaults to `#000`) The content of the filling, can be a color (in hexadecimal) or an absolute image path.
  * opacity - (number: defaults to 0.5) The filling opacity, only used if type is `color` (min: 0, max: 1).
* stroke - (object) The stroke styles. Set it to false to disable stroke.
  * color - (string: defaults to `#F00`) The stroke color (in hexadecimal).
  * opacity - (number: defaults to 1) The stroke opacity (min: 0, max: 1).
  * width - (number: defaults to 1) The stoke width (in px)
* fade - (boolean: defaults to true) Enable fade effect on mouseover (canvas only)
* alwaysOn - (boolean: defaults to false) Enable the hover style on all areas

### Events:

* onReady (function) The function to execute when the shapes are ready.
* onMouseOver (function) The function to execute when the mouse enters a shape.
* onMouseOut (function) The function to execute when the mouse leaves a shape.
* onClick (function) The function to execute when the user click on a shape.

### Example:

To use ShapeHover, you need an image with an image map in your HTML. Just call the constructor with the image element as first parameter and the options object as second parameter.

#### HTML:

    <img id="myimage" width="40" height="20" usemap="#mymap" alt="My Image" src="myimage.png"/>
    <map name="mymap">
        <area shape="poly" coords="0,0,20,0,20,20,0,20" href="http://www.area-1.com" alt="Area 1"/>
        <area shape="poly" coords="20,00,40,00,40,20,20,20" href="http://www.area-2.com" alt="Area 2"/>
    </map>

#### CSS:

    img { border:0 }

#### JavaScript:

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
    
### Notes:

 * Your image must not have border
 * If ShapeHover is initialized before the window.onLoad event, you must specify the dimensions of the image in the image element (width/height attributes)

[options]:http://mootools.net/docs/core/Class/Class.Extras#Options
[events]:http://mootools.net/docs/core/Class/Class.Extras#Events