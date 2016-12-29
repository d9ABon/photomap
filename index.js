
//https://github.com/googlemaps?language=javascript

var markerClusterer = null;
var map = null;

var api_key = 'c9f54b3e05dfaaca105f42bd1a1afd01';

var infowindow = new google.maps.InfoWindow({
    content: ''
});

var markersSet = [];
var MAX_LEN_markersSet = 5000;

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

$('#inline-actions input, #inline-actions select').phoenix();

var site_options = function(optName) {
    return parseInt($('[name="'+optName+'"]').val(), 10);
};

ClusterIcon.prototype.onAdd = function() {
    this.div_ = document.createElement('DIV');
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.cssText = this.createCss(pos);
        this.div_.innerHTML = this.sums_.text;
    }

    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div_);

    var that = this;
    google.maps.event.addDomListener(this.div_, 'click', function(e) {
        e.stopImmediatePropagation();
        that.triggerClusterClick();
    });
};

$(document).on('click', 'ul.clusterImages img', function(e){
    e.preventDefault();
    var previewImg = $(this);
    $('ul.clusterImages img').removeClass('current');

    var img = new Image();
    img.src = previewImg.data('url_m');
    img.onload = function(){
        $('#infoWindowImg').attr('src', previewImg.data('url_m'));
    };

    $('#infoWindowTitle').html(decodeURIComponent(previewImg.data('desc')));
    previewImg.addClass('current');
});

$(document).on('mouseenter', '#infoWindow', function(e){
    map.setOptions({ scrollwheel: false });
}).on('mouseleave', '#infoWindow', function(e){
    map.setOptions({ scrollwheel: true });
}).on('mousewheel', '#infoWindow', function(event, delta) {
    $('ul.clusterImages')[0].scrollLeft -= (delta * 60);
    event.preventDefault();
});

$(document).on('mouseenter', 'ul.clusterImages img', function(e){
    //just preload
    var previewImg = $(this);
    var img = new Image();
    img.src = previewImg.data('url_m');
});

$(document).on('click', '#site_opts', function(e){
    e.preventDefault();
    $('#inline-actions').toggle();
});



function getMarkerEssentialData(google_maps_Marker) {
    return {
        'lat': google_maps_Marker.position.lat(),
        'lng': google_maps_Marker.position.lng(),
        'title': google_maps_Marker.title,
        'url_m': google_maps_Marker.url_m,
        'url_t': google_maps_Marker.url_t
    };
}


function bindInfoWindow(map, marker) {
    function showSingle(marker) {
        var html;
        html = "<p class='infoWindowTitle'>" + marker.title + "</p>" + "<p id='infoWindowImgContainer'><img id='infoWindowImg' src='" + marker.url_m + "'/></p>";
        html = '<div id="infoWindow">'+html+'</div>';
        infowindow.setContent(html);
        infowindow.open(map, marker);
    }
    function showMultiple(markers, centerData, current) {
        var html = '', i;
        if (!current) {
            current = _.sample(markers);
        }
        html += '<p id="infoWindowTitle">'+current.title+'</p>';
        html += '<p id="infoWindowImgContainer"><img id="infoWindowImg" src="'+current.url_m+'" /></p>';
        html += '<br /><ul class="clusterImages">';

        for (i = 0; i < markers.length; i++) {
            html += '<li><img src="'+markers[i].url_t+'" data-url_m="'+markers[i].url_m+'" data-desc="'+encodeURIComponent(markers[i].title)+'" /></li>';
        }
        html += '</ul>';
        html = '<div id="infoWindow">'+html+'</div>';

        infowindow.setContent(html);
        infowindow.setPosition(new google.maps.LatLng(centerData.lat, centerData.lng));
        infowindow.open(map);

        setTimeout(function(){
            $('ul.clusterImages img').each(function(){
                if ($(this).data('url_m') == $('#infoWindowImg').attr('src')) {
                    $(this).addClass('current');
                }
            });
        }, 500);
    }


    if (marker instanceof google.maps.Marker) {
        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                var i, distance, markers = [];
                var currentData = getMarkerEssentialData(marker);
                for (i = 0; i < markersSet.length; i++) {
                    distance = getDistance(currentData, markersSet[i]);
                    if (distance <= site_options('gallery_distance')) {
                        markers.push(markersSet[i]);
                    }
                }

                if (markers.length == 1) {
                    showSingle(marker);
                } else {
                    showMultiple(markers, currentData, marker);
                }
            }
        })(marker));
    } else if (marker instanceof MarkerClusterer) {
        google.maps.event.addListener(markerClusterer, 'clusterclick', function(cluster) {
            var i, distance;
            var markers = cluster.markers_;
            var center = {
                'lat': cluster.center_.lat(),
                'lng': cluster.center_.lng()
            };

            console.log(markers.length);

            //adding markers not from cluster
            for (i = 0; i < markersSet.length; i++) {
                distance = getDistance(center, markersSet[i]);
                if (distance <= site_options('gallery_distance')) {

                    if (!_.findWhere(markers, {'url_m':markersSet[i].url_m, 'url_t': markersSet[i].url_t})) {
                        markers.push(markersSet[i]);
                    }

                }
            }

            showMultiple(markers, center);
        });
    }


}


function refreshMap() {
    $.ajax({
        'url': "https://api.flickr.com/services/rest/",
        'data': {
            'format': 'json',
            'nojsoncallback': 1,
            'bbox': viewportOptions.lng1+','+viewportOptions.lat1+','+viewportOptions.lng0+','+viewportOptions.lat0,
            'accuracy': 11, //1
            'sort': 'interestingness-desc',
            'extras': 'geo,url_t,url_m,description',
            'per_page': site_options('photos_per_request'),
            'api_key': api_key,
            'method': 'flickr.photos.search'
        },
        'dataType': 'json',
        'cache': true,
        'success': onDataRecieved
    });
}
function onDataRecieved(data) {
    var markers = [];

    var i, photo, markerImage, description, tmpMarkerData;

    for (i = 0; i < data.photos.photo.length; i++) {
        photo = data.photos.photo[i];

        try {

            var latLng = new google.maps.LatLng(photo.latitude, photo.longitude);
            markerImage = new google.maps.MarkerImage(photo.url_t, null, null, null, new google.maps.Size(32, 32));
            description = photo.description._content;
            var marker = new google.maps.Marker({
                position: latLng,
                icon: markerImage,
                title: description,
                url_m: photo.url_m, //custom attr
                url_t: photo.url_t, //custom attr
                draggable: false
            });

        } catch (e) {
            console.error('error:');
            console.error(e);
            continue;
        }

        markers.push(marker);

        tmpMarkerData = getMarkerEssentialData(marker);
        if (!_.findWhere(markersSet, {'url_m':tmpMarkerData.url_m, 'url_t': tmpMarkerData.url_t})) {
            markersSet.push(tmpMarkerData);
        }

        // add an event listener for this marker
        bindInfoWindow(map, marker);
    }

    if (markersSet.length > MAX_LEN_markersSet) {
        markersSet = markersSet.slice(markersSet.length - MAX_LEN_markersSet);
    }

    var zoom = site_options('max_zoom');
    var size = site_options('cluster_size');
    var style = site_options('cluster_style');
    zoom = zoom === -1 ? null : zoom;
    size = size === -1 ? null : size;
    style = style === -1 ? null: style;

    try {
        //https://googlemaps.github.io/js-marker-clusterer/docs/reference.html
        markerClusterer = new MarkerClusterer(map, markers, {
            maxZoom: zoom,
            gridSize: size,
            styles: styles[style],
            imagePath: './images/m',
            zoomOnClick: false
        });

        bindInfoWindow(map, markerClusterer);
    } catch(e) {
        console.error('error:');
        console.error(e);
    }
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

    google.maps.event.addDomListener($('#refresh')[0], 'click', function(){
        if (markerClusterer) {
            markerClusterer.clearMarkers();
        }
        refreshMap();
    });

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
