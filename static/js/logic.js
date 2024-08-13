// Create the tile for the backgrounds of the map
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


// Grayscale Layer
var grayscale = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});


// Water color layer
var waterColor = L.tileLayer('http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &amp; USGS'
});

// Topography
let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


// Make a basemaps Object
let basemaps = {
	GrayScale: grayscale,
	"Water Color": waterColor,
	"Topography": topoMap,
	Default: defaultMap
};


// make a map Object
var myMap = L.map("map", {
	center: [36.7783, -119.4179],
	zoom: 5,
	layers: [defaultMap, grayscale, waterColor, topoMap]
});


// Add the default map to the map
defaultMap.addTo(myMap);


// Get the data for the tectonic plates and draw on the map
// Variable to hold the tectonic plates layer
let tectonicplates = new L.layerGroup()

// call the api to get the info for the tectonicplates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
	// concole log
	// console.log(plateData)
	
	// load the data using geoJson and add to the tectonic plates layer group
	L.geoJson(plateData, {
		// add styling
		color: "yellow",
		weight: 1
	}).addTo(tectonicplates);
});

// Add the tectonic plates to the map
tectonicplates.addTo(myMap);

// Variable to hold the earthquake data layer
let earthquakes = new L.layerGroup()

// get the data for the earthquakes and populate the layerGroup
// call the USGS GeoJson API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
	function(earthquakeData){
		// function that chooses Color
		function dataColor(depth){
			if (depth > 90)
				return "red";
			else if (depth > 70)
				return "#fc4903";
			else if (depth > 50)
				return "#fc8403";
			else if (depth > 30)
				return "#fcad03"
			else if (depth > 10)
				return "#cafc03"
			else
				return "green";
		}
		
		// function that determine radius
		function radiusSize(mag){
			if (mag == 0)
				return 1;
			else
				return mag * 5
		}
		
		// add on to the style for each data point
		function dataStyle(feature){
			return{
				opacity: 0.5,
				fillOpacity: 0.5,
				fillColor: dataColor(feature.geometry.coordinates[2]),
				color: "000000",
				radius: radiusSize(feature.properties.mag),
				weight: 0.5,
				stroke: true
			}
		};
		
		// Add geoJson data
		L.geoJson(earthquakeData, {
			// make each feature a marker on the map.
			pointToLayer: function(feature, latLng){
				return L.circleMarker(latLng);
			},
			// set the style for each marker
			style: dataStyle,
			// add pop ups
			onEachFeature: function(feature, layer){
				layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
								Depth: <b>${feature.geometry.coordinates[2]}</b><br>
								Location: <b>${feature.properties.place}</b>`);
			}
		}).addTo(earthquakes);
		
	}
);

// add the earthquake layer to the map
earthquakes.addTo(myMap);


// add the overlay for the tectonic plates and the earthquakes
let overlays = {
	"Tectonic Plates": tectonicplates,
	"Earthquake Data": earthquakes 
}


// Add the layer controllers
L.control
	.layers(basemaps, overlays)
	.addTo(myMap);


// Add the legend to the map
let legend = L.control({
	position: "bottomright"
});

// Add properties to the legend
legend.onAdd = function(){
	// div for the legend
	let div = L.DomUtil.create("div", "info legend");
	
	// set up the intervals
	let intervals = [-10, 10, 30, 50, 70, 90];
	// set the colors for the intervals
	let colors = [
		"green",
		"#cafc03",
		"#fcad03",
		"#fc8403",
		"#fc4903",
		"red"
	];
	
	
	// loop throught the intervals and the colors and generate a label
	// with a color square for each interval.
	for(var i = 0; i < intervals.length; i++)
	{
		// inner html that sets the square for each interval and label
		div.innerHTML += "<i style='background-color: " + colors[i] + "'>"
			+ intervals[i]
			+ (intervals[i + 1] ? "km to " + intervals[i + 1] + "km<br>" : "+")
			+ "</i>" ;
	}
	
	return div;
	
};


// add lengend to the map.
legend.addTo(myMap)
