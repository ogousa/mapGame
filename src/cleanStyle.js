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

var cleanStyleRed = [
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
