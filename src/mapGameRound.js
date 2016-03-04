jQuery(document).ready(function($) {

	var cleanStyle = [
	  	{
	    	featureType: "administrative.province",
	    	stylers: [{ visibility: "off" }]
	  	},
	  	{
		    featureType: "administrative.locality",
		    stylers: [{ visibility: "off" }]
		},
		{
		    featureType: "administrative.neighborhood",
		    stylers: [{ visibility: "off" }]
		},
		{
	    	featureType: "road.highway",
	    	stylers: [{ visibility: "off" }]
	  	},
	  	{
			featureType: "road",
			elementType: "geometry.stroke",
			stylers: [{ color: "#553300" }]
			},
			{
		   	featureType: "road.arterial",
		    stylers: [{ color: "#993300" }]
		},
	  	{
			featureType: "road.highway",
			elementType: "labels",
			stylers: [{ visibility: "off" }]
		},
	  	{
			featureType: "road.arterial",
			elementType: "labels",
			stylers: [{ visibility: "off" }]
		},
	  	{
			featureType: "road.local",
			elementType: "labels",
			stylers: [{ visibility: "off"}]
		},
	  	{
	    	featureType: "water",
	    	elementType: "labels",
	    	stylers: [{ visibility: "off" }]
	  	},
	  	{
	     	featureType: "water",
	     	elementType: "all",
	     	stylers: [ { color: "#fdc95c" } ]
	   	},
	  	{
	    	featureType: "transit",
	    	stylers: [{ visibility: "off" }]
	  	},
	  	{
			stylers: [{ gamma: 0.75 }]
		},
		{
		    featureType: "landscape.natural",
		    stylers: [{ "color": "#9a4c26" }]
		},
		{
		    featureType: "landscape.man_made",
		    stylers: [{ visibility: "off" }]
		},
		{
		    featureType: "landscape.natural.terrain",
		    elementType: "geometry.fill",
		    stylers: [{ visibility: "on" },{ color: "#553300" }]
		},
	  	{
	    	featureType: "poi",
	    	elementType: "geometry",
	    	stylers: [{ visibility: "off" }]
	  	},
	  	{
	    	featureType: "poi.park",
	    	elementType: "labels",
	    	stylers: [{ visibility: "off" }]
	  	}

	];


	var game = (function() {
		return {
			myKey: 			(document.URL.indexOf("file:") == 0)? "" : "&key=AIzaSyBFOqgBAFOtBdfNft3ni5OvGG5bBd3SM40",
			debug: 			false,//true,
			start: 			{lat:40.6865771, lng:-74.0363669},	// New York
		//	start: 			{lat:1.399579, lng:103.978298},		// Singapour
			width: 			parseInt($("#mapDiv").css("width")),
			height: 		parseInt($("#mapDiv").css("height")),
			waterWidth: 	640,	// free Static Maps API V2 is limited to 640x640 image
			waterHeight: 	640,
			waterBorder: 	30,		// distance to the end of the current water map
			zoom: 			14,
			loading: 		true,
			water: 			waterInit()

		};

		function waterInit() {
			var water = new Image();	// create green water map
			water.crossOrigin = "http://maps.googleapis.com/crossdomain.xml";
			return water; 
		}
	})();



	$("#mapBorder").attr("src", "pic/mapRound.png");

	// create main map
    var map = new google.maps.Map(document.getElementById("mapDiv"), { center: game.start, zoom: game.zoom });
	map.setOptions({styles: cleanStyle});
	map.id = "map";

	var moveTo = {x:200,y:0};	// initial move
	var position = {x: (game.width-3)/2, y: (game.height-3)/2};

	// Create an in-memory canvas and store its 2d context
	var waterCanvas = document.createElement('canvas');
	waterCanvas.setAttribute('width', game.waterWidth);
	waterCanvas.setAttribute('height', game.waterHeight);

	// add it to the body on the top
	waterCanvas.style.position = "absolute";
//	waterCanvas.style.top = height + "px";
	waterCanvas.style.top = "0px";

	waterCanvas.style.left = "0px";
	waterCanvas.style.opacity = 0.5;

	if(game.debug)
	{
		document.body.appendChild(waterCanvas);	// add it to the body

	}
	else
	{
		var pointer = document.getElementById("pointer");
        document.body.removeChild(pointer);
	}

	var waterContext = waterCanvas.getContext('2d');

	loadWater();

	function loadWater()
	{
		var center = map.getCenter();

		game.water.src = "http://maps.googleapis.com/maps/api/staticmap?scale=1" +  
		"&center=" + center.lat() + "," + center.lng() + "&zoom=" + game.zoom + "&size=" + game.waterWidth + "x" + game.waterHeight + game.myKey + 
		"&sensor=false&visual_refresh=true&style=element:labels|visibility:off&style=feature:water|color:0x00FF00&style=feature:transit|visibility:off&style=feature:poi|visibility:off&style=feature:road|visibility:off&style=feature:administrative|visibility:off";

		game.water.onload = function() {
			game.loading = false;
	    	// Put the water image inside the water canvas
		//	$('.info').text(this.width + "x" + this.height);
			waterContext.clearRect(0, 0, waterContext.width, waterContext.height);
	   		waterContext.drawImage(this, 0, 0, game.waterWidth, game.waterHeight, 0, 0, waterCanvas.width, waterCanvas.height);
	   	//	waterContext.fillStyle = "rgb(200,0,0)";  
		//	waterContext.fillRect(10, 10, 50, 50);

			position.x = game.waterWidth/2;
			position.y = game.waterHeight/2;
		}
	}

    $("#mapMask").click(function(e){

    	$(".instructions").hide();

		moveTo.x = e.pageX - e.target.offsetLeft - game.width/2;
		moveTo.y = e.pageY - e.target.offsetTop - game.height/2;

		curMove = calculateMove();
	});

	
	var ship = $('.ship');
	ship.addClass("shadowed");

	ship.css("left", (position.x - 25) + "px");
	ship.css("top", (position.y - 24) + "px");
	var speed = 2.0;
		var curLag = 1;
		var steps = 0;
	var shipRadius = 8;
	var direction = 0;
	
	var pointer = $('#pointer');
	pointer.css("left", (position.x - 1) + "px");
	pointer.css("top", game.height + (position.y - 1) + "px");

	// initial movement
	var curMove = calculateMove();


	function calculateMove()
	{
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


	// change map pan and ship direction each N milliseconds
	setInterval(function(){
		if(game.loading)
			return;

		steps--;
		if(steps > 0)
		{
			var bytes = waterContext.getImageData(position.x + curMove.x*shipRadius, position.y + curMove.y*shipRadius, 1, 1).data;

			if(bytes[0] == 0 && bytes[1] > 252 && bytes[2] == 0)
			{
	    		map.panBy(curMove.x, curMove.y);
	    		position.x += curMove.x;
	    		position.y += curMove.y;

	    		pointer.css("left", position.x + "px");
				pointer.css("top", position.y + "px");

				// load new water map
				if((position.x < game.waterBorder || position.x > game.waterWidth - game.waterBorder || 
					position.y < game.waterBorder || position.y > game.waterHeight - game.waterBorder) && !game.loading)
				{
					game.loading = true;
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

	}, 60); 


	setTimeout(function(){
		var tl = new TimelineMax();
		tl.add( TweenLite.to(".ship", 2, {opacity:1, delay:0}) );
		tl.add( TweenLite.to(".instructions", 2, {opacity:1, delay:1}) );
	//	tl.add( TweenLite.to("h2", 2, {opacity:1, delay:6}) );
	//	tl.staggerTo("h2", 1, {className:"+=superShadow", top:"-=10px", ease:Power1.easeIn}, "0.3", "start");

	//	$("h2").addClass("shadowed");
		$(".instructions").addClass("shadowed");
	//	var position = $("h2").position();
	//	$("#myName").css({"left": position.left + 163, "top": position.top + 153});
	//	$("#year").css({"left": position.left + 213, "top": position.top + 117});
	//	tl.add( TweenLite.to("#myName", 1, {opacity:1, delay:0}) );
	//	tl.add( TweenLite.to("#year", 1, {opacity:1, delay:0}) );
		
	//	TweenMax.fromTo([".plane",".planeShadow"], 20, {left:-50}, {left: $(window).width(), delay:20, repeat:-1, repeatDelay:30, ease:Linear.easeNone, onUpdate:updatePlane});
	
	}, 1000);

	var winWidth = parseInt($(window).width());
	var xStartShadow = parseInt($("#mapBorder").css("left"), 10);
	var xEndShadow = xStartShadow + parseInt($("#mapBorder").css("width"), 10) - parseInt($(".planeShadow").css("width"), 10);

	function updatePlane()
	{
		var xPos = parseInt($(".plane").css("left"), 10);
		if(xPos >= winWidth)
			$(".plane").css("left", -50);

		if(xPos > xStartShadow && xPos < xEndShadow)
			$(".planeShadow").css("opacity", 1);
		else
			$(".planeShadow").css("opacity", 0);
	}

	$("#plus").css("left", "768px");
	$("#plus").css("top", "140px");
	$("#plus").on("click", function(){
		if(game.zoom < 18)
		{
			game.zoom++;

			game.loading = true;
			loadWater();
			map.setZoom(game.zoom);
		}
	});
	$("#minus").css("left", "837px");
	$("#minus").css("top", "204px");
	$("#minus").on("click", function(){
		if(game.zoom > 2)
		{
			game.loading = true;
			game.zoom--;
			loadWater();
			map.setZoom(game.zoom);
		}
	});


});

