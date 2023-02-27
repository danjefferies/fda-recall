// good to keep the shared common base URL of all the API endpoints in one constant variable
const BASE_URL = "https://api.fda.gov/food/enforcement.json?search=";
const LIMIT_URL = "&limit=2";
const storedData = {
    "postal-codes" : [],
};

// console.log(BASE_URL+`state:FL`+LIMIT_URL);


// this turns the list of recalls into "cards"
function updateRecallList(recall) {
    
    // iterating through to store variables
    for (r of recall){
        storedData["postal-codes"].push(r.postal_code.slice(0,5));
    
    }
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
}


// Change the results based on the selected state
function handleStateChange() {
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
var map = new L.Map("map", {center: [37.8, -96.9], zoom: 4})
.addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
g = svg.append("g").attr("class", "leaflet-zoom-hide");

function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

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
