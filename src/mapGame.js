'use strict';

jQuery(document).ready(function($) {

	(function() {

		var version = 3;	// version 3 is a round map, version 2 is old map
		var debug =	true;	// to show hidden water map

		var myKey =	(document.URL.indexOf("file:") == 0)? "" : "&key=AIzaSyBFOqgBAFOtBdfNft3ni5OvGG5bBd3SM40";
		var start =	{lat:40.6865771, lng:-74.0363669};	// New York
	//	var start =	{lat:1.399579, lng:103.978298};		// Singapour
		var width = (version == 3)? 1095 : 1180;
		var height = (version == 3)? 1044 : 934;
		var waterWidth = 640;	// free Static Maps API V2 is limited to 640x640 image
		var waterHeight = 640;	// free Static Maps API V2 is limited to 640x640 image
		var waterBorder = 30;	// distance to the end of the current water map
		var zoom = 14;			// initial zoom
		var loading = true;		// prevent the move when water map is loading 
		var tick = 60;			// change map pan and ship direction each N milliseconds

		$('#mapDiv').width(width).height(height);
		$('#mapMask').width(width).height(height);
		$('#mapBorder').width(width).height(height);
		
		$('#ship').css({top: (version == 3)? '350px' : '300px', left: (version == 3)? '560px' : '360px'});
		$('#instructions').css({top: (version == 3)? '50px' : '15px', left: (version == 3)? '430px' : '360px'});
		$('#plane').css({top: (version == 3)? '300px' : '110px'});
		$('#planeShadow').css({top: (version == 3)? '400px' : '210px'});
		
		// set mask/border
		$("#mapBorder").attr("src", (version == 3)? "pic/mapRound.png" : "pic/map2.png");

		// create main map
	    var map = new google.maps.Map(document.getElementById("mapDiv"), { center: start, zoom: zoom });
		map.setOptions({styles: (version == 3)? cleanStyleRed : cleanStyle});

		var northBound = 0;
		var southBound = 0;

		//listen for click and check visible lattitude bounds
        google.maps.event.addListener(map, 'bounds_changed', function() {
         	var bounds = map.getBounds();
            northBound = bounds.getNorthEast().lat();
			southBound = bounds.getSouthWest().lat();
		//	console.log(northBound + " " + southBound)
        });

		// create hidden green water map
		var water = new Image();	
		water.crossOrigin = "http://maps.googleapis.com/crossdomain.xml";

		// Create an in-memory canvas and store its 2d context

	// TODO: move it to jQuery: this doesn't work... 
	//	var waterCanvas = $('<canvas />').width(waterWidth).height(waterHeight).css({position: 'absolute', top: 0, left: width});
	//	$('body').append(waterCanvas);
	//	var waterContext = waterCanvas[0].getContext('2d');

		var waterCanvas = document.createElement('canvas');
		waterCanvas.setAttribute('width', waterWidth);
		waterCanvas.setAttribute('height', waterHeight);

		// add it to the body on the top/right
		waterCanvas.style.position = 'absolute';
		waterCanvas.style.top = '0px';
		waterCanvas.style.left = width + 'px';
		waterCanvas.style.opacity = 1;

		if(debug) {
		// add it to the body just for demo
			$('body').append(waterCanvas);
			var debugLabel = $('<label>').width(waterWidth).css({top: waterHeight, left: width}).addClass('demoText');
			debugLabel.html(`Hidden in-memory canvas with static water map.<br> 
							It is used to track the ship movement on the water (green pixels).<br> 
							Displayed here only for demo.`);
			$('body').append(debugLabel);
		
		} else {
			var pointer = document.getElementById("pointer");
	        document.body.removeChild(pointer);
		}

		var waterContext = waterCanvas.getContext('2d');
		var pointer = $('#pointer');
		pointer.css("z-index", 1);	// move pointer to the top

		loadWater();

		var position = {x: (width-3)/2, y: (height-3)/2};

		var ship = $('#ship');
		ship.addClass("shadowed");
		ship.css("left", (position.x - 25) + "px");
		ship.css("top", (position.y - 24) + "px");
		var speed = 2.0;
		var steps = 0;
		var shipRadius = 8;
		var direction = 0;
		

		// initial movement
		var moveTo = {x:200, y:-30};	
		var curMove = calculateMove();

		// set new direction
	    $("#mapMask").click(function(e) {
	    	$("#instructions").hide();

			moveTo.x = e.pageX - e.target.offsetLeft - width/2;
			moveTo.y = e.pageY - e.target.offsetTop - height/2;

			curMove = calculateMove();
		});

		function calculateMove() {
	  		var deltaX = moveTo.x;		
	  		var deltaY = moveTo.y;		
	  		var toGrad = 180/Math.PI;

			var angleR = Math.atan2(deltaY, deltaX);
			var angle = Math.round((90 + angleR*toGrad)%360); 

			// calculate direction and change animation class
			ship.removeClass('dir'+direction);
			direction = Math.round(angle/15);
			if(direction < 0)
				direction = direction + 24;
			ship.addClass('dir'+direction);

			steps = Math.sqrt(deltaX*deltaX + deltaY*deltaY)/speed;

			return {x:speed*Math.cos(angleR), y:speed*Math.sin(angleR)};
		}

		// load new static map when the ship is close to border
		function loadWater() {
			loading = true;

			var center = map.getCenter();

			water.src = "http://maps.googleapis.com/maps/api/staticmap?scale=1" +  
			"&center=" + center.lat() + "," + center.lng() + "&zoom=" + zoom + "&size=" + waterWidth + "x" + waterHeight + myKey + 
			"&sensor=false&visual_refresh=true&style=element:labels|visibility:off&style=feature:water|color:0x00FF00&style=feature:transit|visibility:off&style=feature:poi|visibility:off&style=feature:road|visibility:off&style=feature:administrative|visibility:off";

			water.onload = function() {
				loading = false;
		    	// Put the water image inside the water canvas
				waterContext.clearRect(0, 0, waterContext.width, waterContext.height);
		   		waterContext.drawImage(this, 0, 0, waterWidth, waterHeight, 0, 0, waterCanvas.width, waterCanvas.height);

				position.x = waterWidth/2;
				position.y = waterHeight/2;
			}
		}

		function updatePlane() {
			var xPos = parseInt($("#plane").css("left"), 10);
			if(xPos >= winWidth)
				$("#plane").css("left", -50);

			if(xPos > xStartShadow && xPos < xEndShadow)
				$("#planeShadow").css("opacity", 1);
			else
				$("#planeShadow").css("opacity", 0);
		}

		// change map pan and ship direction each N milliseconds
		setInterval(function() {
			if(loading)
				return;

			// set the rough limits to make sure the map is visible inside the mask window
			if(northBound >= 85 || southBound <= -85) {
				steps = 0;
				$('#instructions').html('Make zoom and go out of dangerous waters!').show();
				return;
			}

			steps--;
			if(steps > 0)
			{
				var bytes = waterContext.getImageData(position.x + curMove.x*shipRadius, position.y + curMove.y*shipRadius, 1, 1).data;

				if(bytes[0] == 0 && bytes[1] > 252 && bytes[2] == 0)
				{
		    		map.panBy(curMove.x, curMove.y);
		    		position.x += curMove.x;
		    		position.y += curMove.y;

		    		pointer.css("left", (width+position.x - 2) + "px");
					pointer.css("top", (position.y - 2) + "px");

					// load new water map
					if((position.x < waterBorder || position.x > waterWidth - waterBorder || 
						position.y < waterBorder || position.y > waterHeight - waterBorder) && !loading)
					{
						loadWater();
					}
					return;
				}
			}

			// stop Animation
			// fixed Firefox issue:
		//	var y = ship.css("background-position-y");
			var pos = ship.css('background-position').split(' ');
			var y = pos[1];
			ship.removeClass('dir'+direction);
		//	ship.css({'background-position-x': '-150px', 'background-position-y': y});
			ship.css('background-position', '-150px ' + y);

		}, tick); 


		setTimeout(function() {
			var tl = new TimelineMax();
			tl.add( TweenLite.to("#ship", 2, {opacity:1, delay:0}) );
			tl.add( TweenLite.to("#instructions", 2, {opacity:1, delay:1}) );
			$("#instructions").addClass("shadowed");

			if(version < 3) {
				tl.add( TweenLite.to("h2", 2, {opacity:1, delay:6}) );
				tl.staggerTo("h2", 1, {className:"+=superShadow", top:"-=10px", ease:Power1.easeIn}, "0.3", "start");

				$("h2").addClass("shadowed");
				var position = $("h2").position();
				$("#myName").css({"left": position.left + 163, "top": position.top + 153});
				$("#year").css({"left": position.left + 213, "top": position.top + 117});
				tl.add( TweenLite.to("#myName", 1, {opacity:1, delay:0}) );
				tl.add( TweenLite.to("#year", 1, {opacity:1, delay:0}) );
				
				TweenMax.fromTo(["#plane","#planeShadow"], 20, {left:-50}, {left: $(window).width()-50, delay:20, repeat:-1, repeatDelay:30, ease:Linear.easeNone, onUpdate:updatePlane});
			}
		}, 1000);

		var winWidth = parseInt($(window).width()) - 50;
		var xStartShadow = parseInt($("#mapBorder").css("left"), 10);
		var xEndShadow = xStartShadow + parseInt($("#mapBorder").css("width"), 10) - parseInt($("#planeShadow").css("width"), 10);


		$("#plus").css("left", (version == 3)? "768px" : "935px");
		$("#plus").css("top", (version == 3)? "140px" : "157px");
		$("#plus").on("click", function() {
			if(zoom < 18) {
				zoom++;
				loadWater();
				map.setZoom(zoom);
			}
		});
		$("#minus").css("left", (version == 3)? "837px" : "937px");
		$("#minus").css("top", (version == 3)? "204px" : "238px");
		$("#minus").on("click", function() {
			if(zoom > 3) {
				zoom--;
				loadWater();
				map.setZoom(zoom);
			}
		});

	})();

});

