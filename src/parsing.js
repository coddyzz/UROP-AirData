import * as Papa from 'papaparse'
function test1 (){
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
    var geojsondata = 0

fetch('../data/haneda1.csv')
  .then(response => response.text())
  .then((data) => {
    geojsondata = {
  "type": "FeatureCollection",
  "features":[]}

    var results = Papa.parse(data,config);
    console.log(results.data)
    for (var i = 0; i <= results.data.length-1; i++) {
        results.data[i].geometry = JSON.parse(results.data[i].geometry)
        results.data[i].properties = JSON.parse(results.data[i].properties)
    }
    console.log(results.data)
    geojsondata.features = results.data
    console.log(geojsondata)

  })
  return geojsondata

}

console.log(test1())
