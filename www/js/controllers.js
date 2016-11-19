angular.module('app.controllers', ['ngCordova'])


.controller('camCtrl',['$scope','$cordovaBarcodeScanner','$state',
    

   function($scope,$cordovaBarcodeScanner,$state) {

    $scope.scan=function(){

    cordova.plugins.barcodeScanner.scan(
      function (result) {
          alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
          $state.go('app.tab.lugares-detalle', { aId:result.text});
      }, 
      function (error) {
          alert("Scanning failed: " + error);
      },
      {
          "preferFrontCamera" : true, // iOS and Android
          "showFlipCameraButton" : true, // iOS and Android
          "prompt" : "Place a barcode inside the scan area", // supported on Android only
          "formats" : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      }
   );
}



    } 

])

.controller('NuevoFavoritoCtrl', function($scope,ComentarioService,$http,$ionicLoading,$window, SeleccionInterna,$ionicPopup,$state,$stateParams){
 $scope.lugar = SeleccionInterna.getLugarSeleccionado();
   $scope.comentario='';

  $scope.guardar = function(){
    if($scope.comentario){
        $http({
        method : 'post',
        url : 'https://cultural-api.herokuapp.com/api/Comentarios',
        data :{
            id_lugar:$scope.lugar._id,
            foto:"fot",
            nombre:"nombre",
            comentario:$scope.comentario
           }
        }).success(function(data) {

          var alertPopup = $ionicPopup.alert({
            title: 'Hecho',
            template: 'Comentario agregado exitosamente'
          });

          console.log("refrescando ando");
    
        $scope.comentarios = [];
   

          ComentarioService.getAll().then(function(response){
            $scope.comentarios = response.data.reverse();
          })
             .finally(function() {
               // Stop the ion-refresher from spinning
               $scope.$broadcast('scroll.refreshComplete');
});
          alertPopup.then(function(res) {
            $scope.comentario='';
          });
        });
      }else {
        var alertPopup = $ionicPopup.alert({
          title: 'Error',
          template: 'Comentario vacio'
        });
      }
  };

})

.controller('lugaresCtrl', ['$scope','lugaresService','SeleccionInterna','$timeout','$state', '$ionicLoading','$ionicModal','$ionicSlideBoxDelegate',function($scope,lugaresService,SeleccionInterna,$timeout, $state,$ionicLoading ,$ionicModal,$ionicSlideBoxDelegate )  {
//Modal para datos personales
$scope.show = function() {
  $ionicLoading.show({
    template: '<p>Cargando...</p><ion-spinner></ion-spinner>'
  });
};

$scope.hide = function(){
      $ionicLoading.hide();
};
$ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal1 = modal;
    });
    //Inicializando lugares
$scope.lugares = [];
 $scope.$on('$ionicView.enter', function() {

   });
	var lugar= 'Lugares';
 $scope.$on('$ionicView.loaded', function() {
   $scope.show($ionicLoading);
  lugaresService.getAll(lugar).then(function(response){

    console.info(response.data);
    console.log(response.data);
    $scope.lugares = response.data;

  }).finally(function($ionicLoading) {
      // On both cases hide the loading
      $scope.hide($ionicLoading);
    });

});
	$scope.selectLugar=function(lugar){
    SeleccionInterna.setLugarSeleccionado(lugar);
  };
  
    $ionicModal.fromTemplateUrl('templates/image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $ionicSlideBoxDelegate.slide(0);
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
    $scope.$on('modal.shown', function() {
      console.log('Modal is shown!');
    });

    // Call this functions if you need to manually control the slides
    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
  
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };
  
    $scope.goToSlide = function(index) {
      $scope.modal.show();
      $ionicSlideBoxDelegate.slide(index);
    };
  
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };


}])

.controller('detallesCtrl', ['$scope','DetalleService','ComentarioService','$state','SeleccionInterna','$location','$stateParams',function($scope,DetalleService,ComentarioService,$state,SeleccionInterna,$location,$stateParams) {
  var identificador = $stateParams.aId;
  $scope.detalle = [];
  DetalleService.getAll(identificador).then(function(response){
    console.info(response.data);
    console.log(response.data);
    $scope.detalle = response.data;
  });
  $scope.comentarios = [];

  ComentarioService.getAll().then(function(response){
    $scope.comentarios = response.data.reverse();
  });
  

  $scope.go = function ( path ) {
  $location.path( path );
};
$scope.map=function(){
  $state.go('app.tab.mapa');
}

}])

.controller('detallesFavoritoCtrl', ['$scope','DetalleService','ComentarioService','$state','SeleccionInterna',function($scope,DetalleService,ComentarioService,$state,SeleccionInterna) {
  $scope.lugar = SeleccionInterna.getLugarSeleccionado();

  var identificador = $scope.lugar.id_lugar;
  console.log("id",identificador);
  $scope.detalle = [];
  DetalleService.getAll(identificador).then(function(response){
    console.info(response.data);
    console.log(response.data);
    $scope.detalle = response.data;
  });
  $scope.comentarios = [];

  ComentarioService.getAll().then(function(response){
    $scope.comentarios = response.data;
  });
}])

.controller('mapCtrl',['$scope','$ionicLoading','lugaresService','$compile',function($scope,$ionicLoading,lugaresService,$compile){
 var lugaresMap = [];
 var lugar= 'Lugares';

  lugaresService.getAll(lugar).then(function(response){
    lugaresMap = response.data;
    console.info(lugaresMap);
      google.maps.event.addDomListener(window, 'load', initialize(lugaresMap));
  });
  function initialize(data) {
    console.log("Initialize");
    var mapOptions = {
      // the Teide ;-)
      center: {lat: 6.267132, lng: -75.568573},
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      mapTypeControlOptions: {
        mapTypeIds: []
      },
      panControl: false,
      streetViewControl: false,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      }
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    setMarkers(map,data);
    $scope.map = map;

  }

  $scope.centerOnMe = function() {
      if (!$scope.map) {
        return;
      }

      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function(pos) {
        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        $scope.loading.hide();
        var marker2 = new google.maps.Marker({
        position: {lat: pos.coords.latitude, lng: pos.coords.longitude},
        title:"Estás aqui",
        });
        marker2.setMap($scope.map);
        //$scope.map = map;
      }, function(error) {
        alert('Unable to get location: ' + error.message);
      });
    };
        function setMarkers(map,data) {
          // Adds markers to the map.

          // Marker sizes are expressed as a Size of X,Y where the origin of the image
          // (0,0) is located in the top left of the image.

          // Origins, anchor positions and coordinates of the marker increase in the X
          // direction to the right and in the Y direction down.
          var image = {
            url: "img/moai-statues-pascua-island.png",
            // This marker is 20 pixels wide by 32 pixels high.
            //size: new google.maps.Size(20, 32),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            //anchor: new google.maps.Point(0, 32)
          };
          // Shapes define the clickable region of the icon. The type defines an HTML
          // <area> element 'poly' which traces out a polygon as a series of X,Y points.
          // The final coordinate closes the poly by connecting to the first coordinate.
          var shape = {
            coords: [1, 1, 1, 20, 18, 20, 18, 1],
            type: 'poly'
          };
          var infowindows = new Array(data.length);
          var markers= new Array(data.length);
          for (var i = 0; i < data.length; i++) {
              var place = data[i];

              var html="<p>"+place.title +"</p><br>"+place.direccion+"</br>";
              infowindows[i] = new google.maps.InfoWindow({
                 content:html
              });

              console.log("place",place);
              markers[i] = new google.maps.Marker({
              position: {lat: place.latitud, lng: place.longitud},
              icon: image,
              map: map,
              shape: shape,
              title: place.title
            });
            google.maps.event.addListener(markers[i], 'click', (function(marker, i) {
              return function() {
                infowindows[i].open(map, marker);
              }
            })(markers[i], i));
          }
        }

}])


.controller('mapCtrlDetail',['$scope','$ionicLoading','SeleccionInterna','$state','$stateParams','$compile',function($scope,$ionicLoading,SeleccionInterna,$state,$stateParams,$compile){
  var lugar = SeleccionInterna.getLugarSeleccionado();
 console.log('Idparam:' ,$stateParams.aId,'idlugar:',lugar._id);
  console.log('Latitud: ',lugar.latitud,'longitud: ',lugar.longitud);

  console.log("Not initialize");
  google.maps.event.addDomListener(window, 'load', initialize());

  function initialize() {
    console.log("Initialize");
    var mapOptions = {
      // the Teide ;-)
      center: {lat: lugar.latitud, lng: lugar.longitud},
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      mapTypeControlOptions: {
        mapTypeIds: []
      },
      panControl: false,
      streetViewControl: false,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      }
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var contentString = "<div><a ng-click='clickTest()'>"+lugar.title+"</a></div>";
            var compiled = $compile(contentString)($scope);

            var infowindow = new google.maps.InfoWindow({
              content: compiled[0]
            });


    var marker = new google.maps.Marker({
    position: mapOptions.center,
    title:lugar.nombre,
    icon: "img/moai-statues-pascua-island.png"
    });
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });
    marker.setMap(map);
    $scope.map = map;

  }
  $scope.centerOnMe = function() {
      if (!$scope.map) {
        return;
      }

      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function(pos) {
        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        $scope.loading.hide();
        var marker2 = new google.maps.Marker({
        position: {lat: pos.coords.latitude, lng: pos.coords.longitude},
        title:"Estás aqui",
        });
        marker2.setMap($scope.map);
        //$scope.map = map;
      }, function(error) {
        alert('Unable to get location: ' + error.message);
      });
    };


  $scope.clickTest = function() {
          alert(lugar.description);
        };

}]);
