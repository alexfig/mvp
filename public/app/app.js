var mapchats = angular.module('mapChatApp', ['uiGmapgoogle-maps'])
.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBnhu1TH2pbHGxhCjyDwwbZB5gQXrZq1Bw',
        libraries: 'places'
    });
})
.controller("mapCtrl", function($scope, uiGmapGoogleMapApi, uiGmapIsReady) {
  $scope.markerClick = markerClick;
  $scope.messages = {data: [], control:{}};
  window.scopee = $scope;
  window.socket = io('http://localhost:8080');
  window.socket.on('updateMessages', function(data){
    _.forEach(messagesDecorator(data), function(message){
      var matchedChat = _.find($scope.messages.data, 'coords', message.coords);
      if(matchedChat){
        matchedChat.text = matchedChat.text + message.text
      } else {
        $scope.messages.data.push(message);
      }
    });
    console.log($scope.messages.data);
    if($scope.messages.control.updateModels){
      $scope.messages.control.updateModels();
      console.log('refresh');
    }
    setTimeout(function(){
    _.forEach(document.getElementsByClassName('chatroom'),function(el){
      el.scrollTop = el.scrollHeight;
      if( $(el).is($scope.currentChat)) el.focus();
    });
  },100);
  });
  $scope.windowOptions = {
    visible: true
  };

  $scope.onClick = function() {
    //$scope.windowOptions.visible = !$scope.windowOptions.visible;
  };

  $scope.closeClick = function() {
    //$scope.windowOptions.visible = false;
  };
  $scope.marker = {
    id: 0,
    coords: {latitude: 37.757, longitude: -122.437},
    control: {}
  };
  $scope.searchbox = { template:'searchbox.tpl.html', events: {}};
  $scope.map = { 
    center: {latitude: 37.757, longitude: -122.437},
    zoom: 3,
    control: {},
    events: {},
    options: {disableDoubleClickZoom: true}
  };
  window.mappp = $scope.map;

  uiGmapGoogleMapApi.then(function(maps) {
    $scope.messages.options = {icon: {
                path: maps.SymbolPath.CIRCLE,
                scale: 2,
                strokeColor: 'red',
                strokeWeight: 3
              } };
    var markers = [];
    $scope.searchbox.events = {
      places_changed: function (searchBox) {
        var places = searchBox.getPlaces();
        var place = _.first(places);
          // Create a marker for each place.
        $scope.marker.coords = {latitude: place.geometry.location.lat(),longitude: place.geometry.location.lng()}
        $scope.map.center = {latitude: place.geometry.location.lat(),longitude: place.geometry.location.lng()};
        console.log(place.geometry.location)
        $scope.mapInst.panTo(place.geometry.location);
        $scope.windowOptions.visible= true
        document.getElementById("messageInput").focus();
      }
    };
    $scope.marker.options = { 
      draggable: true,
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 8,
        strokeColor: 'blue',
        strokeWeight: 2
      } 
    };
  uiGmapIsReady.promise(1).then(function(instances) {
    console.log('ready');
    instances.forEach(function(inst) {
      $scope.mapInst = inst.map;
      $scope.mapInst.addListener('dblclick', function(event) {
        $scope.marker.coords = {latitude: event.latLng.lat(),longitude: event.latLng.lng()}
        $scope.marker.control.getGMarkers()[0].setPosition(event.latLng);
        document.getElementById("messageInput").focus();
      });
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          $scope.marker.coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          $scope.mapInst.panTo({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });     
        });
      }
    });
  });
  });
function markerClick(gmark, event, model){
  $scope.marker.coords = _.clone(model.coords);
  $scope.marker.control.getGMarkers()[0].setPosition(gmark.getPosition());
  model.show = true;
  $scope.windowOptions.visible= false;
}
});
mapchats.controller("messageCtrl", function($scope, $rootScope){
  $scope.message = {};
  $scope.send = function(){
    var text = '<div class="text">' + $scope.message.text + '</div>';
    socket.emit('postMessage',{
      coords: $rootScope.$root.$$childHead.marker.coords,
      text: text
    });
    $scope.message.text = '';
    $rootScope.$root.$$childHead.windowOptions.visible= false;
  };
});

mapchats.controller("chatCtrl", function($scope, $rootScope, $element){
  $scope.message = {};
  console.log($scope);
  $scope.send = function(){
    var text = '<div class="text">' + $scope.message.text + '</div>';
    socket.emit('postMessage',{
      coords: $scope.model.coords,
      text: text
    });
    // $scope.model.text = $scope.model.text + text;
    $scope.message.text = '';
    $rootScope.$root.$$childHead.windowOptions.visible= false;
    $rootScope.$root.$$childHead.currentChat = $($element).find('input');
  };
});

var id =1;
function messagesDecorator(messages){
  _.forEach(messages, function (message){
    _.defaults(message, {
      id: id++,
      isIconVisibleOnClick:false,
      show:true,
      options: {disableAutoPan: true
      },
      onClick: function() {}
    });
  });
  return messages;
};