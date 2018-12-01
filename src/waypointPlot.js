
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOTEzMWRlMi05YjBlLTQ4YmEtYjcwYS00MzA0MTA5MTZkZWEiLCJpZCI6NTI3NSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0Mjg2ODA5MX0.ef3qQCWjP8HqeeYm7VREq0GuezQUNDH9J0ZrQgN6ss4';
    var viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: Cesium.createWorldTerrain()
    });
    // Load Cesium World Terrain
    viewer.terrainProvider = Cesium.createWorldTerrain({
        requestWaterMask : true, // required for water effects
        requestVertexNormals : true // required for terrain lighting
    });
    // Enable depth testing so things behind the terrain disappear.
    viewer.scene.globe.depthTestAgainstTerrain = true;
    
    // Create an initial camera view
    var initialPosition = new Cesium.Cartesian3.fromDegrees(103.799515, 1.060035, 56310.082799425431); // singapore
    var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(3.1077496389876024807, -61.987223091598949054, 0.025883251314954971306);
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
    
   var kmlOptions = {
    camera : viewer.scene.camera,
    canvas : viewer.scene.canvas,
    clampToGround : true
};

    var geocachePromise = Cesium.GeoJsonDataSource.load("../data/parsed.geojson")

    // Add geocache billboard entities to scene and style them
    geocachePromise.then(function(dataSource) {
    // Add the new data as entities to the viewer
    viewer.dataSources.add(dataSource);

    // Get the array of entities
    var geocacheEntities = dataSource.entities.values;

    for (var i = 0; i < geocacheEntities.length; i++) {
        var entity = geocacheEntities[i];
        if (Cesium.defined(entity.billboard)) {
            // Adjust the vertical origin so pins sit on terrain
            entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
            // Disable the labels to reduce clutter
            entity.label = undefined;
            entity.billboard.color = Cesium.Color.CORAL
            // Add distance display condition
            entity.billboard.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 1000000.0);
        }
    }



});
