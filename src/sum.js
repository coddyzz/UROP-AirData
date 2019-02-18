 //Import papaparse for csv -> json, could be avoided if export .json directly from sqlite, however I faced a bit difficulty in doing so
 //Requires "npm install papaparse" in command line to install this package
 import * as Papa from 'papaparse'

// Please adjust Token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOTEzMWRlMi05YjBlLTQ4YmEtYjcwYS00MzA0MTA5MTZkZWEiLCJpZCI6NTI3NSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0Mjg2ODA5MX0.ef3qQCWjP8HqeeYm7VREq0GuezQUNDH9J0ZrQgN6ss4';

// Create viewer, please adjust the DOM selection
var viewer = new Cesium.Viewer("cesiumContainerS", {
        terrainProvider: Cesium.createWorldTerrain()
    });

    
// Create an initial camera view
var initialPosition = new Cesium.Cartesian3.fromDegrees(103.799515, 1.060035, 56310.082799425431); // singapore
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(3.1077496389876024807, -61.987223091598949054, 0.025883251314954971306);

// Create HomeCarmera
var homeCameraView = {
        destination : initialPosition,
        orientation : {
            heading : initialOrientation.heading,
            pitch : initialOrientation.pitch,
            roll : initialOrientation.roll
        }
    };

    // Set the initial view
    viewer.scene.camera.setView(homeCameraView);
    
    // Add some camera flight animation options
    homeCameraView.duration = 2.0;
    homeCameraView.maximumHeight = 2000;
    homeCameraView.pitchAdjustHeight = 2000;
    homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;

    // Override the default home button
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        viewer.scene.camera.flyTo(homeCameraView);
    });
    
// Create general config settings for parsing csv to json
var config = {
    delimiter: ",", // auto-detect
    newline: "",    // auto-detect
    quoteChar: '"',
    escapeChar: '"',
    header: true,
    transformHeader: undefined,
    dynamicTyping: true,
    preview: 0,
    encoding: "",
    worker: false,
    comments: false,
    step: undefined,
    complete: undefined,
    error: undefined,
    download: false,
    skipEmptyLines: true,
    chunk: undefined,
    fastMode: undefined,
    beforeFirstChunk: undefined,
    withCredentials: undefined,
    transform: undefined
}

// Create a dummy variable geojsondata
var geojsondata = 0

// Fetch csv data , Cesium could fetch .geojson directly, thus using a R backend will simplify a lot of the codes below
fetch('../data/routeCoHaneda.csv')
  .then(response => response.text())
  .then((data) => {

    // Create the general header in a geojson format, the data information goes under the array corresponding to "features"  
    geojsondata = {
        "type": "FeatureCollection",
        "features":[]}

    // Parse csv to json
    var results = Papa.parse(data,config);
    
    // Check json data
    //console.log(results.data)

    // Here's the json --> geojson conversion (part that goes into backend)

        //Create dummy variables
        var final = []
        var coor = []

        //Create the first pathID
        var pathID = results.data[0].pathID

        //For each entry in the data, 
        //if pathID is the same as previous, append the coordinate into a single array with pathID as key (thus create polyline)
        //else change pathID.
        //this requires pathID to be in sequence, thus ORDER BY in SQLITE is important
        for (var i = 0; i <= results.data.length-1; i++) {
            
            if (results.data[i].pathID == pathID){
                coor.push(JSON.parse(results.data[i].coordinates))
            }
            else{
                final.push({"type" :  "Feature" , "geometry" : {"type": "LineString","coordinates": coor}, "properties": {"name": results.data[i].pathID}})
                pathID =  results.data[i].pathID
                coor= []
            }
        }

        // Assign the object consists of polyline data to the overall geojson variable with "features" as key
        geojsondata.features = final

        // Check data
        //console.log(geojsondata)

  })

    // Visualisation for Routes
    .finally(function(){

    //Set Data
    var geocachePromise = Cesium.GeoJsonDataSource.load(geojsondata)
    // console.log(geojsondata)

    // Add geocache billboard entities to scene and style them
    geocachePromise.then(function(dataSource) {

    //Load Data
    viewer.dataSources.add(dataSource);

    // Get the array of entities(polylines)
    var geocacheEntities = dataSource.entities.values;

    for (var i = 0; i < geocacheEntities.length; i++) {
        var entity = geocacheEntities[i];
        if (Cesium.defined(entity.polyline)) {

            // 1 random color for each path
            entity.polyline.material = Cesium.Color.fromRandom()
            // Set width of line
            entity.polyline.width = 2

            // Add granularity, however runs slower and line sometimes dissappear (due to no altitude attribute)
            // entity.polyline.granularity = Cesium.Math.toRadians(0.3)

            // Add distance display condition
            // entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 1000000000.0);
        }
    }



    })}
    )

    // New dataset for billboard
    // I parsed this directly using Sqlite and manually typed the overall header for geojson.
    // Just a different approach

        //Load Data
        var geocachePromise = Cesium.GeoJsonDataSource.load("../data/waypoint.geojson")

        // Add geocache billboard entities to scene and style them
        geocachePromise.then(function(dataSource) {

        // Add the new data as entities to the viewer
        viewer.dataSources.add(dataSource);

        // Get the array of entities(billboards)
        var geocacheEntities = dataSource.entities.values;

        for (var i = 0; i < geocacheEntities.length; i++) {
            var entity = geocacheEntities[i];

            if (Cesium.defined(entity.billboard)) {

                // Adjust the vertical origin so pins sit on terrain
                entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

                // Disable the labels to reduce clutter (enable for WayPoint Names)
                entity.label = undefined;

                // Set a color
                entity.billboard.color = Cesium.Color.CORAL

                // Add distance display condition of maximum 1000000 meters (for camera) afterwhich billboards are not shown
                entity.billboard.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 1000000.0);
            }
        }})
