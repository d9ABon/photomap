
//https://github.com/googlemaps?language=javascript

var markerClusterer = null;
var map = null;

var api_key = 'c9f54b3e05dfaaca105f42bd1a1afd01';

var infowindow = new google.maps.InfoWindow({
    content: ''
});

var viewportOptions = localStorage.getItem('viewportOptions');
if (viewportOptions) {
    viewportOptions = JSON.parse(viewportOptions);
} else {
    viewportOptions = {
        lat0: 40.806204139814675,
        lat1: 40.7568105999827,
        lng0: -73.91447639465332,
        lng1: -74.01738739013672,
        zoom: 14
    };
}



viewportOptions = {
    lng0: 33.758754,
    lng1: 33.964576,
    lat0: 44.598901,
    lat1: 44.695992,
    zoom: 12
};


viewportOptions = {
    lng0: 33.758754,
    lng1: 33.964576,
    lat0: 44.598901,
    lat1: 44.695992,
    zoom: 12
};



function bindInfoWindow(marker, map, infowindow, photosData) {
    google.maps.event.addListener(marker, 'click', function() {
        var html, photo;
        if (photosData.length == 1) {
            photo = photosData[0];
            html = "<p>"+photo.description+"</p>"+"<p><img src='"+photo.src+"'/></p>";
        }
        infowindow.setContent(html);
        infowindow.open(map, marker);
    });
}


function refreshMap() {
    $.ajax({
        'url': "https://api.flickr.com/services/rest/",
        'data': {
            'format': 'json',
            'nojsoncallback': 1,
            //'bbox': "33.758754,44.598901,33.964576,44.695992",
            'bbox': viewportOptions.lng1+','+viewportOptions.lat1+','+viewportOptions.lng0+','+viewportOptions.lat0,
            'accuracy': 11, //1
            'sort': 'interestingness-desc',
            'extras': 'geo,url_t,url_m,description',
            'per_page': 250,
            'api_key': api_key,
            'method': 'flickr.photos.search'
        },
        'dataType': 'json',
        'cache': true,
        'success': onDataRecieved
    });
}
function onDataRecieved(data) {
    console.log(data);

    if (markerClusterer) {
        markerClusterer.clearMarkers();
    }

    var markers = [];

    var i, photo, markerImage, description;

    for (i = 0; i < data.photos.photo.length; i++) {
        photo = data.photos.photo[i];

        var latLng = new google.maps.LatLng(photo.latitude, photo.longitude);
        markerImage = new google.maps.MarkerImage(photo.url_t, null, null, null, new google.maps.Size(32, 32));
        description = photo.description._content;
        var marker = new google.maps.Marker({
            position: latLng,
            draggable: false,
            icon: markerImage,
            title: description
        });
        markers.push(marker);

        // add an event listener for this marker
        bindInfoWindow(marker, map, infowindow, [{'description':description, 'src': photo.url_m}]);
    }

    var zoom = parseInt(document.getElementById('zoom').value, 10);
    var size = parseInt(document.getElementById('size').value, 10);
    var style = parseInt(document.getElementById('style').value, 10);
    zoom = zoom === -1 ? null : zoom;
    size = size === -1 ? null : size;
    style = style === -1 ? null: style;

    //https://googlemaps.github.io/js-marker-clusterer/docs/reference.html
    markerClusterer = new MarkerClusterer(map, markers, {
        maxZoom: zoom,
        gridSize: size,
        styles: styles[style],
        imagePath: './images/m',
        zoomOnClick: false
    });
}

var viewportUserChanged = _.throttle(function(){
    viewportOptions = {
        lat0: map.getBounds().getNorthEast().lat(),
        lng0: map.getBounds().getNorthEast().lng(),
        lat1: map.getBounds().getSouthWest().lat(),
        lng1: map.getBounds().getSouthWest().lng(),
        zoom: map.getZoom()
    };
    localStorage.setItem('viewportOptions', JSON.stringify(viewportOptions));


    refreshMap();
}, 3000);

function initialize() {

    //console.log(google.maps.MapTypeId);

    var options = {
        zoom: viewportOptions.zoom,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        center: new google.maps.LatLng((viewportOptions.lat1 + viewportOptions.lat0) / 2, (viewportOptions.lng1 + viewportOptions.lng0) / 2)
    };

    map = new google.maps.Map($('#map')[0], options);

    google.maps.event.addDomListener($('#refresh')[0], 'click', refreshMap);

    google.maps.event.addDomListener($('#clear')[0], 'click', clearClusters);

    google.maps.event.addListener(map, "click", function(event) {
        infowindow.close();
    });

    map.addListener('center_changed', viewportUserChanged);
    map.addListener('bounds_changed', viewportUserChanged);
    map.addListener('zoom_changed', viewportUserChanged);
}

function clearClusters(e) {
    e.preventDefault();
    e.stopPropagation();
    markerClusterer.clearMarkers();
}

google.maps.event.addDomListener(window, 'load', initialize);
