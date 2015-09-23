function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.757, lng: -122.437},
    zoom: 3
  });
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
    });
  }
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      // Create a marker for each place.
      var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 5,
              strokeColor: 'blue',
              strokeWeight: 2
            },
        draggable: true
      });
      var chatWindow = new google.maps.InfoWindow({
        content: contentString
      });
      markers.push(marker);
      marker.addListener('click', function() {
        chatWindow.open(map, marker);
      });
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    map.panTo(place.geometry.location);
    });
  });
  var contentString = '<div id="content" ng-app="mapChatApp" ng-controller="messageCtrl">' +
      '<form name="shortlyForm" ng-submit="addLink()" novalidate>\
         <input name="link" type="url"\
           ng-model="link.url"\
           placeholder="Enter message" required\
           ng-class="{"error": shortlyForm.$invalid && shortlyForm.$dirty}"/>\
         <button type="submit" value="Shorten" ng-disabled="shortlyForm.$invalid">\
           add\
         </button>\
       </form>\
       </div>';
 
  map.addListener('dblclick', function(event) {
    addMarker(event.latLng);
  });
  function addMarker(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            strokeColor: 'blue',
            strokeWeight: 2
          },
      draggable: true
    });
    var chatWindow = new google.maps.InfoWindow({
      content: contentString
    });
    chatWindow.open(map, marker);
    marker.addListener('click', function() {
      chatWindow.open(map, marker);
    });
  }
};