// good to keep the shared common base URL of all the API endpoints in one constant variable
const BASE_URL = "https://api.fda.gov/food/enforcement.json?search=";
const LIMIT_URL = "&sort=report_date:desc&limit=3";
const storedData = {
    "postal-codes" : [],
    "street-parse" : [],
    "state" : []
    // "address" : []
};


// this turns the list of recalls into "cards"
function updateRecallList(recall) {
    
    // iterating through to store variables
    for (r of recall){
        storedData["postal-codes"].push(r.postal_code.slice(0,5));
        // storedData["address"].push(r.address_1 + "+" + r.city + "," + r.state)
        storedData["street-parse"].push(r.address_1.split(' ').map(s => s+"+")); 
        storedData["state"].push(r.state);
    }

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
                .text(function(d) {return "Recall date: " + d.recall_initiation_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3')})
              .append("p")
                .text(function(d) { return "Reason: " + d.reason_for_recall.charAt(0).toUpperCase() + d.reason_for_recall.slice(1)})
              .append("p")
                .text(function(d) { 
                  if (d.status === "Completed") { 
                    return "Status: " + d.status + ", but FDA yet to investigate."
                  } else {
                    return "Status: " + d.status}
                  })
                .style('color', function(d){
                  if (d.status === "Completed") {
                    return 'orange'
                  } if (d.status === "Ongoing") {
                    return 'red'
                  } else {
                    return 'green'
                  }
                })
              .append("div")
                .attr("class", "map")
        // update => update
        //     .transition().duration(1000)
        //     .style("opacity", "0")
        //     .remove(),
    	// exit => exit
        //     .transition().duration(500)
        //     .style("opacity", "0")
        //     .remove()
    );

}


// Change the results based on the selected state
function handleStateChange() {

  // grab the selected state
  var selectedState = d3.select("#state-picker").property("value");
  // request the list of recalls from that state
  var url = BASE_URL + "state:" + selectedState + LIMIT_URL;
  showSpinner(); // user feedback
  fetch(url) // fire off the promise-based async request for data
    .then((responseSession) => responseSession.json()) // the HTTP session has started
    .then((resolvedData) => updateRecallList(resolvedData.results.sort())) // the data came back so deal with it
    .finally(() => hideSpinner())  // hide the user feedback
    .catch(error => showError(error.message));  // and show any errors to user

      // LEAFLET MAP FOR EACH STATE
      var stateToCenter = {
      "AL" : [32.318230, -86.902298],
      "AK" : [66.160507,	-153.369141],
      "AZ" : [34.048927, 	-111.093735],
      "AR" : [34.799999, -92.199997],
      "CA" : [36.778259,	-119.417931],
      "CO" : [39.113014,	-105.358887],
      "CT":  [41.599998,	-72.699997],
      "DC" : [38.9072, -77.0369],
      "DE" : [39.000000,	-75.500000],
      "FL" : [27.994402,	-81.760254],
      "GA" : [33.247875,	-83.441162],
      "HI" : [19.741755,	-155.844437],
      "ID" : [44.068203, -114.742043],
      "IL" : [40.000000,	-89.000000],
      "IN" : [40.273502,	-86.126976],
      "KS" : [38.500000,	-98.000000],
      "KY" : [37.839333,	-84.270020],
      "LA" : [30.391830, -92.329102],
      "ME" : [45.367584,	-68.972168],
      "MD" : [39.045753,	-76.641273],
      "MA" : [42.407211,	-71.382439],
      "MI" : [44.182205,	-84.506836],
      "MN" : [46.392410, -94.636230],
      "MS" : [33.000000, 	-90.000000],
      "MO" : [38.573936,	-92.603760],
      "MT" : [46.965260,	-109.533691],
      "NE" : [41.500000,	-100.000000],
      "NV" : [39.876019,	-117.224121],
      "NH" : [44.000000, -71.500000],
      "NJ" : [39.833851,	-74.871826],
      "NM" : [34.307144,	-106.018066],
      "NY" : [43.000000,	-75.000000],
      "NC" : [35.782169,	-80.793457],
      "ND" : [47.650589,	-100.437012],
      "OH" : [40.367474,	-82.99621],
      "OK" : [	36.084621,	-96.921387],
      "OR" : [	44.000000,	-120.500000],
      "PA" : [	41.203323,	-77.194527],
      "RI" : [	41.742325,	-71.742332],
      "SC" : [	33.836082,	-81.163727],
      "SD" : [44.500000,	-100.000000],
      "TN" : [	35.860119,	-86.660156],
      "TX" : [	31.000000,	-100.000000],
      "UT" : [	39.419220,	-111.950684],
      "VA" : [37.926868,	-78.024902],
      "WA" : [	47.751076,	-120.740135],
      "WV" : [39.000000, -80.500000],
      "WI" : [44.500000,	-89.500000],
      "WY": [	43.075970, -107.290283]
    }
      
    let currentCenter = stateToCenter[selectedState]
    
    // var map = new L.Map("map", {center: [37.8, -96.9], zoom: 6})
    var map = new L.Map("map", {center: currentCenter, zoom: 6})
    .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
    
    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");
    
    
    
    // This is for the leaflet map
    // var markers = [];
    //     for (var i = 0; i < data.length; i++) {
    //         var item = data[i]
    
    //     }


    //  const MAP_URL = "https://nominatim.openstreetmap.org/search?q=";
//   const END_URL = "&format=json&polygon=1&addressdetails=1";


// var mapurl = MAP_URL + streetParse[0] + END_URL;
// // //  + "," + storedData["state"]
// console.log(mapurl);

}

// helper function to show the spinner
const hideSpinner = () => d3.select("#spinner").style("display", "none");
// helper function to hide the spinner
const showSpinner = () => d3.select("#spinner").style("display", "block");
// helper funciton to show error message
const showError = (msg) =>
  d3.select("#error").text(msg).style("display", "block");





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
