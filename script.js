const app = {};

app.apiKey = "fe35ac72901446148ba4c27a3cc2c638";

$("form").on("submit", function (e) {
  e.preventDefault();
  $('html').animate({
    scrollTop: $("#results").offset().top
  }, 2000);

  let startingLocation = $(".startingLocationInput").val();
  let endLocation = $(".endLocationInput").val();
  let requiredNumberOfBikes = $(".numberOfBikesInput option:selected").val();
  let requiredNumberOfDocks = $(".numberOfDocksInput option:selected").val();
  console.log(
    startingLocation,
    endLocation,
    requiredNumberOfBikes,
    requiredNumberOfDocks
  );
  app.getStartingLocationCoordinates(startingLocation, requiredNumberOfBikes);
  app.getEndLocationCoordinates(endLocation, requiredNumberOfDocks);
});


app.getStartingLocationCoordinates = function(query, requiredNumberOfBikes) {
  $.ajax({
    url: `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=fe35ac72901446148ba4c27a3cc2c638`,
    method: "GET",
    dataType: "json",
    data: {
      key: `${app.apiKey}`,
      q: `${query}`
    }
  }).then(function(result) {
    /*  */
    let searchQueryLatitude = result.results[0].geometry.lat;
    let searchQueryLongitude = result.results[0].geometry.lng;
    console.log(searchQueryLatitude, searchQueryLongitude);
    app.getStartingLocationBikeData(
      searchQueryLatitude,
      searchQueryLongitude,
      requiredNumberOfBikes
    );
  });
};

app.getEndLocationCoordinates = function(query, requiredNumberOfDocks) {
  $.ajax({
    url: `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=fe35ac72901446148ba4c27a3cc2c638`,
    method: "GET",
    dataType: "json",
    data: {
      key: `${app.apiKey}`,
      q: `${query}`
    }
  }).then(function(result) {
    let searchEndQueryLatitude = result.results[0].geometry.lat;
    let searchEndQueryLongitude = result.results[0].geometry.lng;
    app.getEndLocationDockData(
      searchEndQueryLatitude,
      searchEndQueryLongitude,
      requiredNumberOfDocks
    );
  });
};

app.getStartingLocationBikeData = function(
  searchQueryLatitude,
  searchQueryLongitude,
  requiredNumberOfBikes
) {
  $.ajax({
    url: `https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information`,
    method: "GET",
    dataType: "json"
  }).then(function(bikeResult) {
    // console.log(bikeResult);
    // console.log(searchQueryLatitude, searchQueryLongitude, bikeResult);
    bikeResult.data.stations.forEach(function(individualStation) {
      let stationId = individualStation.station_id;
      let startingBikeLatitude = individualStation.lat;
      let startingBikeLongitude = individualStation.lon;
      let stationName = individualStation.name;
      // console.log(stationId, startingBikeLatitude, startingBikeLongitude);
      app.calculateDistance(
        searchQueryLatitude,
        searchQueryLongitude,
        startingBikeLatitude,
        startingBikeLongitude,
        "K",
        stationId,
        stationName,
        requiredNumberOfBikes
      );
    });
  });
};

app.getEndLocationDockData = function(
  searchEndQueryLatitude,
  searchEndQueryLongitude,
  requiredNumberOfDocks
) {
  $.ajax({
    url: `https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information`,
    method: "GET",
    dataType: "json"
  }).then(function(dockResult) {
    dockResult.data.stations.forEach(function(individualStation) {
      let stationId = individualStation.station_id;
      let endDockLatitude = individualStation.lat;
      let endDockLongitude = individualStation.lon;
      let stationName = individualStation.name;
      app.calculateEndDistance(
        searchEndQueryLatitude,
        searchEndQueryLongitude,
        endDockLatitude,
        endDockLongitude,
        "K",
        stationId,
        stationName,
        requiredNumberOfDocks
      );
    });
  });
};

app.calculateDistance = function(
  lat1,
  lon1,
  lat2,
  lon2,
  unit,
  stationId,
  stationName,
  requiredNumberOfBikes
) {
  let eachStationName = stationName;
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    if (dist <= 0.5) {
      app.getNumberOfAvailableBikes(
        stationId,
        eachStationName,
        requiredNumberOfBikes,
        dist
      );
    }
  }
};

app.calculateEndDistance = function(
  lon1,
  lat2,
  lat1,
  lon2,
  unit,
  stationId,
  endStationName,
  requiredNumberOfDocks
) {
  let eachEndStationName = endStationName;
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    if (dist <= 0.5) {
      app.getNumberOfAvailableDocks(
        stationId,
        eachEndStationName,
        requiredNumberOfDocks,
        dist
      );
    }
  }
};

app.getNumberOfAvailableBikes = function(
  stationId,
  stationName,
  requiredNumberOfBikes,
  dist
) {
  $.ajax({
    url: `https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status`,
    method: "GET",
    dataType: "json"
  }).then(function(stationResults) {
    stationResults.data.stations.forEach(function(individualStation) {
      let requiredNumberOfBikesInteger = parseInt(requiredNumberOfBikes);
      if (stationId === individualStation.station_id) {
        if (
          requiredNumberOfBikesInteger <= individualStation.num_bikes_available
        ) {
          const startingLocationHtml = `<div class="startingStationContainer">
                <div class="startingStation">
                    <div class="startingStationLocation">
                    <span class="stationName">Located at ${stationName}</span>
                    <span class="distance"><i class="fas fa-walking"></i> Approximately ${Math.round(
                      (dist / 4) * 60
                    )} min. walking or ${parseFloat(dist).toFixed(2)} km</span>
                </div>

                <div class="startingStationBikesAvailable">
                    <span class="bikesAvailable">${
                      individualStation.num_bikes_available
                    }</span>
                    <span class="bikesAvailableText">Bikes Available</span>
                </div>
            </div>`;
          //${Math.round(dist * 1000)} to get meters
          $(".results").append(startingLocationHtml);
        }
      }
    });
  });
};

app.getNumberOfAvailableDocks = function(
  stationId,
  stationName,
  requiredNumberOfDocks,
  dist
) {
  $.ajax({
    url: `https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status`,
    method: "GET",
    dataType: "json"
  }).then(function(stationResults) {
    stationResults.data.stations.forEach(function(individualStation) {
      let requiredNumberOfDocksInteger = parseInt(requiredNumberOfDocks);
      if (stationId === individualStation.station_id) {
        if (
          requiredNumberOfDocksInteger <= individualStation.num_docks_available
        ) {
          console.log(
            `The station is located at ${stationName}. The station ID is ${individualStation.station_id}. We need ${requiredNumberOfDocksInteger} docks, and this station has ${individualStation.num_docks_available} docks.`
          );
          const endLocationHtml = `<div class="endStationContainer">
                <div class="endStation">
                    <div class="endStationLocation">
                    <span class="stationName">Located at ${stationName}</span>
                    <span class="distance"><i class="fas fa-walking"></i> Approximately ${Math.round(
                      (dist / 4) * 60
                    )} min. walking or ${parseFloat(dist).toFixed(2)} km</span>
                </div>

                <div class="endStationDocksAvailable">
                    <span class="docksAvailable">${
                      individualStation.num_docks_available
                    }</span>
                    <span class="docksAvailableText">Docks Available</span>
                </div>
            </div>`;
          $(".endResults").append(endLocationHtml);
        }
      }
    });
  });
};

app.init = function() {
  console.log("ready");
};

$(document).ready(function() {
  app.init();
});
