/*
---
script: ShapeHover.js

description: Add rollover effect on an image map

license: MIT-style license.

authors: Yannick Croissant

inspiration:
	Inspired by [jQuery Maphilight](http://davidlynch.org/js/maphilight/docs/) Copyright (c) 2008 [David Lynch](http://davidlynch.org), [MIT License](http://opensource.org/licenses/mit-license.php)

requires:
 core/1.2.3: '*'
 more/1.2.3.1: [Assets]

provides: [ShapeHover]

...
*/

var ShapeHover = new Class({

	Implements: [Options, Events],
	
	options: {
		fill: {				// Set it to false to disable filling
			type: 'color',	// Can be color or image
			content: '#000',// Can be a color (in hex) or an absolute image path
			opacity: .5		// Opacity, only used if type is color (min: 0, max: 1)
		},
		stroke: {			// Set it to false to disable stroke
			color: '#F00',	// Color (in hex)
			opacity: 1,		// Opacity (min: 0, max: 1)
			width: 1		// Width in px
		},
		fade: true,			// Fade effect on :hover (canvas only)
		alwaysOn: false,		// If true, all areas got the :hover style by default,
		onReady: $empty,
		onMouseOver: $empty,
		onMouseOut: $empty,
		onClick: $empty
	},

	/*
	 * Contructor
	 */
	initialize: function(element, options){
		this.element = document.id(element);
		this.map = document.getElement('map[name="' + this.element.get('usemap').split('#')[1] + '"]'); // Get the map related to the image
		this.setOptions(options);
		
		// Detect to technologie to use : canvas or vml
		this.type = document.createElement('canvas') && document.createElement('canvas').getContext ? 'canvas' : (document.namespaces ? 'vml' : false);
		
		// If the browser is not supported, exit
		if (!this.type || !this.map) return false; 
		
		// Add namespace and css for vml
		if (this.type == 'vml') {
			document.createStyleSheet().addRule("v\\:shape", "display:inline-block");
			document.namespaces.add("v", "urn:schemas-microsoft-com:vml", "#default#VML");
		}
		
		if (this.options.fill.type != 'image') return this.ready();
		
		// Preload the hover image (clean for canvas, hacky for vml)
		if (this.type == 'canvas') this.fillContent = new Asset.image(this.options.fill.content, {onload: this.ready.bind(this)});
		else {
			// Create an hidden vml image at the bottom of the page (no onload event, just a fake preload)
			var tmp = new Element('div', {styles:{position:'absolute', left:'-9999em'}});
			tmp.inject(this.element, 'after');
			tmp.innerHTML = '<v:rect><v:fill type="tile" src="' + this.options.fill.content + '" /></v:rect>';
			this.ready();
		}
	},
	
	/* 
	 * The document is ready (technologie detected, namespace added, image preloaded)
	 * We can now manipulate the DOM to add the elements and the events
	 */
	ready: function(){
		// Create the wrapper and inject it before the image
		this.wrap = new Element('div', {
			styles: {
				background: 'url(' + this.element.get('src') + ')',
				height: this.element.getSize().y,
				position: 'relative',
				width: this.element.getSize().x
			}
		}).inject(this.element, 'before');
		
		// Render the image transparent, and inject it in the wrapper
		this.element.style.opacity = 0;
		if(Browser.Engine.trident) this.element.style.filter = 'Alpha(opacity=0)';
		this.element.setStyles({position: 'absolute', left: 0, top: 0, padding: 0, border: 0});
		this.wrap.adopt(this.element);
		
		// Create the canvas (always called canvas, even if it is vml under IE)
		this.canvas = this.createCanvas().set({
			styles: {
				border: 0,
				left: 0,
				padding: 0,
				position: 'absolute',
				top: 0
			},
			width: this.element.getSize().x,
			height: this.element.getSize().y
		});
		
		if(this.options.alwaysOn) {
			// Add the shape over all areas
			this.map.getElements('area[coords]').forEach(function(el) {
				var shape = this.shapeFromArea(el);
				this.addShapeTo(shape[0], shape[1]);
			}.bind(this));
		} else {
			// Add events on each area
			this.map.getElements('area[coords]')
				.addEvent('mouseover', function(e) {
					var shape = this.shapeFromArea(e.target);
					this.addShapeTo(shape[0], shape[1]);
					this.fireEvent('onMouseOver', e);
				}.bind(this))
				.addEvent('mouseout', function(e){
					this.clearCanvas();
					this.fireEvent('onMouseOut', e);
				}.bind(this))
				.addEvent('click', function(e){
					this.fireEvent('onClick', e);
				}.bind(this));
		}
		
		 // Inject the canvas before the image
		this.canvas.inject(this.element, 'before');
		this.fireEvent('onReady');
	},
	
	/*
	 * Create the canvas (or vml) root element and return it
	 */
	createCanvas: function() {
		if (this.type == 'canvas') {
			var c = new Element('canvas', {
				styles: {
					width: this.element.getSize().x + 'px',
					height: this.element.getSize().y + 'px'
				}
			});
			c.getContext("2d").clearRect(0, 0, c.width, c.height);
			
			// Set the options for the fade-in effect
			if (this.options.fade) {
				c.set({
					tween: {duration: 'short'}
				});
			}
			
			return c;
		}
		return new Element('var', {
			styles: {
				display: 'block',
				height: this.element.getSize().y + 'px',
				overflow: 'hidden',
				width: this.element.getSize().x + 'px',
				zoom: 1
			}
		});
	},
	
	/*
	 * Add a shape in the canvas
	 */
	addShapeTo: function(shape, coords) {
		if (this.type == 'canvas') {
			// Init the opacity for the fade effect
			if (this.options.fade) this.canvas.set('opacity', 0);
			
			var context = this.canvas.getContext('2d');
			
			// Draw the shape according to his type
			context.beginPath();
			if (shape == 'rect') context.rect(coords[0], coords[1], coords[2] - coords[0], coords[3] - coords[1]);
			else if (shape == 'circ') context.arc(coords[0], coords[1], coords[2], 0, Math.PI * 2, false);
			else if (shape == 'poly') {
				context.moveTo(coords[0], coords[1]);
				for (var i = 2, coordsL = coords.length; i < coordsL; i += 2) {
					context.lineTo(coords[i], coords[i + 1]);
				}
			}
			context.closePath();
			
			// Fill the shape
			if (this.options.fill) {
				// Fill it with an image
				if (this.options.fill.type == 'image') {
					var pattern = context.createPattern(this.fillContent ,'repeat');
					context.fillStyle = pattern;
				// else fill it with a color
				} else context.fillStyle = 'rgba(' + this.options.fill.content.hexToRgb(true).join(',') + ',' + this.options.fill.opacity + ')';
				context.fill();
			}
			
			// Add stroke to the shape
			if (this.options.stroke) {
				context.strokeStyle = 'rgba(' + this.options.stroke.color.hexToRgb(true).join(',') + ',' + this.options.stroke.opacity + ')';
				context.lineWidth = this.options.stroke.width;
				context.stroke();
			}
			
			// Start the fade-in effect
			if (this.options.fade) this.canvas.tween('opacity', 1);
		
		// Ho shit, we are under IE
		} else {
			// The background position is very weird under vml (look at this http://msdn.microsoft.com/en-us/library/bb229615%28VS.85%29.aspx )
			// So, we have to calculate our background position in this way :
			// Shape width = (X coord of the most-on-the-right point) - (X coord of the most-on-the-left point)
			// Shape height = (Y coord of the most-on-the-top point) - (Y coord of the most-on-the-bottom point)
			// Position X = -1 * (X coord of the most-on-the-left point) / (Shape width)
			// Position Y = -1 * (Y coord of the most-on-the-left point) / (Shape height)
			// That's it ! Thanks Microsoft
			var x = [], y = [];
			coords.filter(function(item, index){
				if (index % 2) y.push(item);		// Put Y coords in an array
				else x.push(item);					// Put X coords in another array
			}.bind(this));
			x = -1 * x.min() / (x.max() - x.min());	// The equation explained before
			y = -1 * y.min() / (y.max() - y.min());	// The same one, for the Y axis
			
			// Draw the child elements
			if (this.options.fill && this.options.fill.type == 'image') var fill = '<v:fill type="tile" position="' + x + ',' + y + '" src="' + this.options.fill.content + '" />';
			else var fill = '<v:fill opacity="' + (this.options.fill ? this.options.fill.opacity : 0) + '" />';
			var stroke = this.options.stroke ? 'strokeweight="' + this.options.stroke.width+'px" stroked="t" strokecolor="' + this.options.stroke.color + '"' : 'stroked="f"';
			var opacity = '<v:stroke opacity="' + (this.options.stroke ? this.options.stroke.opacity : 0) + '"/>';
			
			// Draw the shape according to his type
			if(shape == 'rect') var e = '<v:rect filled="t" ' + stroke + ' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + coords[0] + 'px;top:' + coords[1] + 'px;width:' + (coords[2] - coords[0]) + 'px;height:' + (coords[3] - coords[1]) + 'px;">' + fill + opacity + '</v:rect>';
			else if(shape == 'circ') var e = '<v:oval filled="t" ' + stroke + ' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + (coords[0] - coords[2]) + 'px;top:' + (coords[1] - coords[2]) + 'px;width:' + (coords[2] * 2) + 'px;height:' + (coords[2] * 2) + 'px;">' + fill + opacity + '</v:oval>';
			else if(shape == 'poly') var e = '<v:shape coordorigin="0,0" filled="t" ' + stroke + ' fillcolor="' + (this.options.fill ? this.options.fill.content : '') + '" coordsize="' + this.canvas.width + ',' + this.canvas.height + '" path="m ' + coords[0] + ','+coords[1] + ' l ' + coords.join(',') + ' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:'+this.canvas.width+'px;height:'+this.canvas.height+'px;">' + fill + opacity + '</v:shape>';
			
			// Big hack because IE8 has some fucking weird bugs ( http://www.lrbabe.com/?p=104 )
			var tmp = document.createElement('div');
			tmp.style.display = 'none';
			document.body.appendChild(tmp);
			tmp.innerHTML = e;
			e = tmp.childNodes[0];
			document.id(e).inject(this.canvas);
			document.id(tmp).destroy();
		}
	},
	
	/*
	 * Empty the canvas
	 */
	clearCanvas: function() {
		if (this.type == 'canvas') this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
		else this.canvas.empty();
	},

	/*
	 * Get the shape type (rect, poly or circ) and the coords of the shape
	 * return an array with the shape type and the coords as another array
	 */
	shapeFromArea: function(area) {
		return [
			area.get('shape').toLowerCase().substr(0,4), 
			area.get('coords').split(',').map(function(item){
				return parseFloat(item);
			})
		];
	}
});