fdaRecalls.app = {// good to keep the shared common base URL of all the API endpoints in one constant variable

  initialize: () => {
    fdaRecalls.app.updateState('AL');
    const url = new URL(window.location);
    const preloadFips = url.searchParams.get('fips');
    if(preloadFips){
      const matchedCounty = OurCup.data.counties.filter(c => c.fips == preloadFips);
      if(matchedCounty.length == 1) {
        OurCup.app.updateResultsFromCounty(matchedCounty[0].fips.toString(), matchedCounty[0].name, matchedCounty[0].state)
      }
    }
  },





// const BASE_URL = "https://api.fda.gov/food/enforcement.json?search=";
// const LIMIT_URL = "&limit=2";
// const storedData = {
//     "postal-codes" : [],
// },

BASE_URL: "https://api.fda.gov/food/enforcement.json?search=",
LIMIT_URL: "&limit=2",

// console.log(BASE_URL+`state:FL`+LIMIT_URL);

// this turns the list of recalls into "cards"
// function updateRecallList(recall) {
  updateRecallList: () => {
    
    // iterating through to store variables
    // for (r of recall){
    //     storedData["postal-codes"].push(r.postal_code.slice(0,5));
    
    // }
    // console.log(storedData)

  d3.select("#recall") // pull out the existing DOM row
    .html("") // just empty out all the current items showing
    .selectAll("div.col-md-4") // grab any existing column children
    .data(recall) // grab the list of recalls
    .join(  // work with the two lists together
      (enter) =>
        enter
          .append("div")
            .attr("class", "col-md-4")
            .append("div")
              .attr("class", "recall")
              .append("h3")
                .text((d) => d.product_description)
              .append("p")
                .text((d) => d.recall_initiation_date)
              .append("p")
                .text((d) => d.reason_for_recall)
              .append("div")
                .attr("class", "map")
        // update => update
        //     .transition().duration(500)
        //     .style("opacity", "0")
        //     .remove(),
    	// exit => exit
        //     .transition().duration(500)
        //     .style("opacity", "0")
        //     .remove()
    );
},


// function handleAutodetect() {
  handleAutodetect: () => {
  d3.selectAll('#interactive button').property('disabled', true);
  updateStatus(true, "Detecting your location...");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fdaRecalls.app.handleGeoLocateSuccess, fdaRecalls.app.handleGeoLocateError);
  } else {
    fdaRecalls.app.onGeoLocateError("unsupported");
  }
},


handleGeoLocateSuccess: (position) => {
  fdaRecalls.app.updateResultsFromLatLng(position.coords.latitude, position.coords.longitude);
},

handleGeoLocateError: (error) => {
  d3.selectAll('#interactive button').property('disabled', false);
  fdaRecalls.app.updateStatus(true, "Couldn't detect your location - sorry!");
  switch(error.code) {
      case "unsupported":
        fdaRecalls.log("Browser doesn't support GeoLocation.");
          break;
      case error.PERMISSION_DENIED:
        fdaRecalls.log("User denied the request for Geolocation.");
          break;
      case error.POSITION_UNAVAILABLE:
        fdaRecalls.log("Location information is unavailable.");
          break;
      case error.TIMEOUT:
        fdaRecalls.log("The request to get user location timed out.");
          break;
      case error.UNKNOWN_ERROR:
        fdaRecalls.log("An unknown error occurred.");
          break;
  }
},

updateResultsFromLatLng: (lat,lng) => {
  fetch("https://geo.fcc.gov/api/census/area?lat="+lat+"&lon="+lng+"&censusYear=2020&format=json")
    .then((response) => response.json())
    .then((data) => fdaRecalls.app.updateResultsFromCounty(data.results[0].state,
                                                       data.results[0].postal_code));
},

// updateStates: (state) => {
//   const states = fdaRecalls.results.state;
//   const options = states.map(c => "<option value=\""+c.state+"\">"+c.name+"</option>")
//   d3.select('#state-select').html(options);
// },

// Change the results based on the selected state
// function handleStateChange() {
  handleStateChange: () => {
  // grab the selected state
  const selectedState = d3.select("#state-picker").property("value");
  // request the list of recalls from that state
  const url = BASE_URL + "state:" + selectedState + "&sort=report_date:desc" + LIMIT_URL;
  showSpinner(); // user feedback
  fetch(url) // fire off the promise-based async request for data
    .then((responseSession) => responseSession.json()) // the HTTP session has started
    .then((resolvedData) => updateRecallList(resolvedData.results.sort())) // the data came back so deal with it
    .finally(() => hideSpinner())  // hide the user feedback
    .catch(error => showError(error.message));  // and show any errors to user


    // This is for the leaflet map
// var markers = [];
//     for (var i = 0; i < data.length; i++) {
//         var item = data[i]

//     }

// LEAFLET MAP FOR EACH STATE
// var map = new L.Map("map", {center: [37.8, -96.9], zoom: 4})
// .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));

// var svg = d3.select(map.getPanes().overlayPane).append("svg"),
// g = svg.append("g").attr("class", "leaflet-zoom-hide");

// function projectPoint(x, y) {
//     var point = map.latLngToLayerPoint(new L.LatLng(y, x));
//     this.stream.point(point.x, point.y);
//   }

},

// function updateStatus(show, msg) {
updateStatus: (show, msg) => {
    d3.select("#statusWrapper").style("display", (show) ? "block" : "none");
    d3.select("#status").html(msg);
  },

// helper function to show the spinner
// const hideSpinner = () => d3.select("#spinner").style("display", "none"),
hideSpinner: () => d3.select("#spinner").style("display", "none"),
// helper function to hide the spinner
// const showSpinner = () => d3.select("#spinner").style("display", "block"),
showSpinner: () => d3.select("#spinner").style("display", "block"),
// helper funciton to show error message
// const showError
showError: (msg) =>
  d3.select("#error").text(msg).style("display", "block")
};






// turn the list of states into a drop down menu
// function handleStates(stateList) {
//     const states = new Set(stateList.map(e => e.state))
//     console.log(states)
//   d3.select("#state-picker") // pull out the existing menu from the DOM
//     .selectAll("option") // grab the options on the page already (ie. none)
//     .data(stateList.sort().filter((c) => c.length > 0)) // grab the list of cities
//     .join(
//       (enter) =>
//         enter
//           .append("option")
//             .text((d) => d)
//             .property("value", (d) => d)
//     );
// }

// make a request to list all the cities available to browse
// function fetchStates() {
//     const url = "https://api.fda.gov/food/enforcement.json?search=distribution_pattern:%22nationwide%22&limit=1000"; // setup the API endpoint we will call
//   showSpinner(); // give the user some feedback
//     fetch(url) // fire of an promise-based async request for the data
//         .then((responseSession) => responseSession.json()) // the HTTP session started; grab the data
//         .then((resolvedData) => (handleStates(resolvedData.results))) // the data is ready; deal with it
//         .finally(() => hideSpinner()) // no matter what we should hide the spinner
//         .catch((error) => showError(error.message)); // remember to show any error to user
// }