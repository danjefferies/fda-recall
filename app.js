// good to keep the shared common base URL of all the API endpoints in one constant variable
const BASE_URL = "https://api.fda.gov/food/enforcement.json?search=state:";
const LIMIT_URL = "&sort=report_date:desc&limit=5";
// const storedData = {
//     "postal-codes" : [],
//     "street-parse" : [],
//     "state" : []
//     // "address" : []
// };

// LOAD AND CREATE POINTS FOR THE MAP
var data;

function addMarkers() {
  data.forEach(function(d) {
    let color;
    if (d.status === "Completed"){
      color = '#D68910';
    } else if (d.status === "Terminated") {
      color = '#138D75'
    } else {
      color = '#C0392B'
    }

    let title = d.product_description;
    let status = d.status;

    var popup = L.popup()
      .setContent(status + ": " + title)

    var marker = L.circleMarker([+d.lat, +d.lon], {
      color
      })
    marker.addTo(map)
      .bindPopup(popup);
  })
}



// INITIALIZE THE MAP
var map = new L.Map("map", {center: [37.8, -96.9], zoom: 4})
.addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"))

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
g = svg.append("g").attr("class", "leaflet-zoom-hide");


// load the points for the map
d3.csv("./map.csv")
  .then(function(csv) {
    data = csv;
    addMarkers();
  });


// this turns the list of recalls into "cards"
function updateRecallList(recall) {
    
    // iterating through to store variables
    // for (r of recall){
    //     storedData["postal-codes"].push(r.postal_code.slice(0,5));
    //     // storedData["address"].push(r.address_1 + "+" + r.city + "," + r.state)
    //     storedData["street-parse"].push(r.address_1.split(' ').map(s => s+"+")); 
    //     storedData["state"].push(r.state);
    // }

  d3.select("#recall")
    .html("") // empty out all the current items showing
    .selectAll("div.col-md-4") // grab any existing column children
    .data(recall)
    .join((enter) => enter
          .append("div")
            .attr("class", "col-md-4")
          .append("div")
            .attr("class", function(d){
              if (d.status === "Terminated") {
                return "faded"
              } else if (d.status === "Ongoing") {
                return "ongoing"
              } else {
                return "recall"
              }
            })
              .append("h4")
                .text((d) => d.product_description)
              .append("h5")
                .text((d) => d.city + ", " + d.state)
              .append("p")
                .text(function(d) {return "Recall date: " + d.recall_initiation_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3')})
              .append("p")
                .text(function(d) {
                  if (d.classification === "Class I") {
                    return 'Hazard: Most serious/dangerous'
                  } else if (d.classification === "Class II") {
                    return "Hazard: Potentially dangerous" 
                  } else {
                    return "Hazard: Low"
                  }
                })
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
                    return '#C0392B'
                  } if (d.status === "Ongoing") {
                    return 'red'
                  } else {
                    return '#138D75'
                  }
                })
              .append("div")
                .attr("class", "map")
    );

}


// Change the results based on the selected state
function handleStateChange() {
  // grab the selected state
  var selectedState = d3.select("#state-picker").property("value");

  // error handling: 'choose a state'
  if (selectedState === "NULL"){
    map.flyTo([37.8, -96.9], 4);
    return;
  }

  // request the list of recalls from that state

  if (selectedState === "OR"){
    var url = "https://api.fda.gov/food/enforcement.json?search=state:%22OR%22&sort=report_date:desc&limit=5"
  } else {
    var url = BASE_URL + selectedState + LIMIT_URL;
  }

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
      "DC" : [38.9072,     -77.0369],
      "DE" : [39.000000,	-75.500000],
      "FL" : [27.994402,	-81.760254],
      "GA" : [33.247875,	-83.441162],
      "HI" : [19.741755,	-155.844437],
      "ID" : [44.068203, -114.742043],
      "IL" : [40.000000,	-89.000000],
      "IN" : [40.273502,	-86.126976],
      "IA" : [42.032974,	-93.581543],
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
      "OK" : [36.084621,	-96.921387],
      "OR" : [44.000000,	-120.500000],
      "PA" : [41.203323,	-77.194527],
      "RI" : [41.742325,	-71.742332],
      "SC" : [33.836082,	-81.163727],
      "SD" : [44.500000,	-100.000000],
      "TN" : [35.860119,	-86.660156],
      "TX" : [31.000000,	-100.000000],
      "UT" : [39.419220,	-111.950684],
      "VT" : [44.000000,	-72.699997],
      "VA" : [37.926868,	-78.024902],
      "WA" : [47.751076,	-120.740135],
      "WV" : [39.000000, -80.500000],
      "WI" : [44.500000,	-89.500000],
      "WY": [	43.075970, -107.290283]
  }
    
    
    // ANIMATE THE MAP TO MOVE TO NEW COORDINATE CENTERS
    let currentCenter = stateToCenter[selectedState]
    map.flyTo(currentCenter, 6);
}

// helper function to show the spinner
const hideSpinner = () => d3.select("#spinner").style("display", "none");
// helper function to hide the spinner
const showSpinner = () => d3.select("#spinner").style("display", "block");
// helper funciton to show error message
const showError = (msg) =>
  d3.select("#error").text(msg).style("display", "block");

