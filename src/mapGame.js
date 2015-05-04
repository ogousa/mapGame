jQuery(document).ready(function($) {

	var cleanStyle = [
		{
			featureType: "administrative.province",
			stylers: [{ visibility: "off" }]
		},
		{
			featureType: "road.highway",
			stylers: [{ visibility: "off" }]
		},
		{
			featureType: "water",
			elementType: "labels",
			stylers: [{ visibility: "off" }]
		},
		{
			featureType: "water",
			elementType: "all",
			stylers: [ { color: "#99bbdd" } ]
		},
		{
			featureType: "transit.line",
			stylers: [{ visibility: "off" }]
		},
		{
			featureType: "transit.station.rail",
			stylers: [{ visibility: "off" }]
		},
		{
			stylers: [{ gamma: 0.75 }]
		}
	];

	var myKey = "&key=AIzaSyBFOqgBAFOtBdfNft3ni5OvGG5bBd3SM40";
	if(document.URL.indexOf("file:") == 0)
		myKey = "";

	var debug = true;//false;

	var center = {lat:40.6865771, lng:-74.0363669};
	var width = parseInt($("#mapDiv").css("width"));
	var height = parseInt($("#mapDiv").css("height"));

	var waterWidth = 640;	// free Static Maps API V2 is limited to 640x640 image 
	var waterHeight = 640;
	var waterBorder = 30;	// distance to the end of the current water map

	var zoom = 14;
	var loading = true;

	$("#mapBorder").attr("src", "pic/map2.png");

	// create main map
    var map = new google.maps.Map(document.getElementById("mapDiv"), { center: center, zoom: zoom });
	map.setOptions({styles: cleanStyle});
	map.id = "map";

	var moveTo = {x:0,y:-140};	// initial move
	var position = {x: (width-3)/2, y: (height-3)/2};

	// Create an in-memory canvas and store its 2d context
	var waterCanvas = document.createElement('canvas');
	waterCanvas.setAttribute('width', waterWidth);
	waterCanvas.setAttribute('height', waterHeight);

	// add it to the body on the top
	waterCanvas.style.position = "absolute";
	waterCanvas.style.top = height + "px";
	waterCanvas.style.left = "0px";
	waterCanvas.style.opacity = 0.5;

	if(debug)
	{
		document.body.appendChild(waterCanvas);	// add it to the body
	}
	else
	{
		var pointer = document.getElementById("pointer");
        document.body.removeChild(pointer);
	}

	var waterContext = waterCanvas.getContext('2d');

	loadWater(center, zoom, waterWidth, waterHeight);

	function loadWater(center, zoom, width, height)
	{

		// create green water map
		var water = new Image();
		water.crossOrigin = "http://maps.googleapis.com/crossdomain.xml";
		water.src = "http://maps.googleapis.com/maps/api/staticmap?scale=1" +  
		"&center=" + center.lat + "," + center.lng + "&zoom=" + zoom + "&size=" + width + "x" + height + myKey + 
		"&sensor=false&visual_refresh=true&style=element:labels|visibility:off&style=feature:water|color:0x00FF00&style=feature:transit|visibility:off&style=feature:poi|visibility:off&style=feature:road|visibility:off&style=feature:administrative|visibility:off";

		water.onload = function() {
			loading = false;
	    	// Put the water image inside the water canvas
		//	$('.info').text(this.width + "x" + this.height);
			waterContext.clearRect(0, 0, waterContext.width, waterContext.height);
	   		waterContext.drawImage(this, 0, 0, this.width, this.height, 0, 0, waterCanvas.width, waterCanvas.height);
	   	//	waterContext.fillStyle = "rgb(200,0,0)";  
		//	waterContext.fillRect(10, 10, 50, 50);

			position.x = waterWidth/2;
			position.y = waterHeight/2;
		}
	}

    $("#mapMask").click(function(e){

    	$(".instructions").hide();

		moveTo.x = e.pageX - e.target.offsetLeft - width/2;
		moveTo.y = e.pageY - e.target.offsetTop - height/2;

		curMove = calculateMove();
	});

	
	var ship = $('.ship');
	ship.addClass("shadowed");

	ship.css("left", (position.x - 25) + "px");
	ship.css("top", (position.y - 24) + "px");
	var speed = 2.2;
		var curLag = 1;
		var steps = 0;
	var shipRadius = 8;
	var direction = 0;
	
	var pointer = $('#pointer');
	pointer.css("left", (position.x - 1) + "px");
	pointer.css("top", height + (position.y - 1) + "px");

	// initial movement
	var curMove = calculateMove();


	function calculateMove()
	{
  		var deltaX = moveTo.x;		
  		var deltaY = moveTo.y;		
  		var toGrad = 180/Math.PI;

		var angleR = Math.atan2(deltaY, deltaX);
		var angle = Math.round((90 + angleR*toGrad)%360); 

		ship.removeClass('dir'+direction);
			direction = Math.round(angle/15);
			if(direction < 0)
				direction = direction + 24;
		ship.addClass('dir'+direction);

		steps = Math.sqrt(deltaX*deltaX + deltaY*deltaY)/speed;

		return {x:speed*Math.cos(angleR), y:speed*Math.sin(angleR)};
	}


	// change map pan and ship direction each 100 milliseconds
	setInterval(function() {
		if(loading)
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
				if((position.x < waterBorder || position.x > waterWidth - waterBorder || 
					position.y < waterBorder || position.y > waterHeight - waterBorder) && !loading)
				{
					loading = true;
					var center = map.getCenter();
					loadWater({lat: center.k, lng: center.D}, zoom, width, height);
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

	}, 80); 


	setTimeout(function(){
		var tl = new TimelineMax();
		tl.add( TweenLite.to(".ship", 2, {opacity:1, delay:0}) );
		tl.add( TweenLite.to(".instructions", 2, {opacity:1, delay:1}) );
		tl.add( TweenLite.to("h2", 2, {opacity:1, delay:6}) );
		tl.staggerTo("h2", 1, {className:"+=superShadow", top:"-=10px", ease:Power1.easeIn}, "0.3", "start");

		$("h2").addClass("shadowed");
		$(".instructions").addClass("shadowed");
		var position = $("h2").position();
		$("#myName").css({"left": position.left + 163, "top": position.top + 153});
		$("#year").css({"left": position.left + 213, "top": position.top + 117});
		tl.add( TweenLite.to("#myName", 1, {opacity:1, delay:0}) );
		tl.add( TweenLite.to("#year", 1, {opacity:1, delay:0}) );
		
		TweenMax.fromTo([".plane",".planeShadow"], 20, {left:-50}, {left: $(window).width(), delay:20, repeat:-1, repeatDelay:30, ease:Linear.easeNone, onUpdate:updatePlane});
	
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

	$("#plus").css("left", "935px");
	$("#plus").css("top", "157px");
	$("#plus").on("click", function(){
		if(zoom < 18)
		{
			zoom++;

			loading = true;
			var center = map.getCenter();
			loadWater({lat: center.k, lng: center.D}, zoom, width, height);
			map.setZoom(zoom);
		}
	});
	$("#minus").css("left", "937px");
	$("#minus").css("top", "238px");
	$("#minus").on("click", function(){
		if(zoom > 2)
		{
			loading = true;
			var center = map.getCenter();
			zoom--;
			loadWater({lat: center.k, lng: center.D}, zoom, width, height);
			map.setZoom(zoom);
		}
	});


});

