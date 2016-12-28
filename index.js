
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

var site_options = localStorage.getItem('site_options');
function saveSiteOptions() {
    site_options = {
        'photos_per_request': parseInt($('[name="photos_per_request"]').val()),
        'max_zoom': parseInt($('[name="max_zoom"]').val(), 10),
        'cluster_size': parseInt($('[name="cluster_size"]').val(), 10),
        'cluster_style': parseInt($('[name="cluster_style"]').val(), 10)
    };
    localStorage.setItem('site_options', JSON.stringify(site_options));
}
if (!site_options) {
    saveSiteOptions();
} else {
    site_options = JSON.parse(site_options);
    _.mapObject(site_options, function(val, key){
        $('[name="'+key+'"]').val(val);
    });
}
$(function(){
    $('#inline-actions input, #inline-actions select').change(function(){
        saveSiteOptions();
    });
});



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
    $('#infoWindowImg').attr('src', previewImg.data('url_m'));
    $('#infoWindowTitle').html(decodeURIComponent(previewImg.data('desc')));
    previewImg.addClass('current');
});

$(document).on('click', '#site_opts', function(e){
    e.preventDefault();
    $('#inline-actions').toggle();
});



function bindInfoWindow(map, marker) {
    if (marker instanceof google.maps.Marker) {
        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                var html;
                html = "<p class='infoWindowTitle'>" + marker.title + "</p>" + "<p id='infoWindowImgContainer'><img id='infoWindowImg' src='" + marker.url_m + "'/></p>";
                infowindow.setContent(html);
                infowindow.open(map, marker);
            }
        })(marker));
    } else if (marker instanceof MarkerClusterer) {
        google.maps.event.addListener(markerClusterer, 'clusterclick', function(cluster) {
            var markers = cluster.markers_;
            var html = '', i;
            var rand_marker = _.sample(markers);
            html += '<p id="infoWindowTitle">'+rand_marker.title+'</p>';
            html += '<p id="infoWindowImgContainer"><img id="infoWindowImg" src="'+rand_marker.url_m+'" /></p>';
            html += '<p><ul class="clusterImages">';

            for (i = 0; i < markers.length; i++) {
                html += '<li><img src="'+markers[i].url_t+'" data-url_m="'+markers[i].url_m+'" data-desc="'+encodeURIComponent(markers[i].title)+'" /></li>';
            }
            html += '</ul></p>';

            infowindow.setContent(html);
            infowindow.setPosition(new google.maps.LatLng(cluster.center_.lat(), cluster.center_.lng()));
            infowindow.open(map);

            setTimeout(function(){
                $('ul.clusterImages img').each(function(){
                    if ($(this).data('url_m') == $('#infoWindowImg').attr('src')) {
                        $(this).addClass('current');
                    }
                });
            }, 500);
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
            'per_page': site_options['photos_per_request'],
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

    var markers = [];

    var i, photo, markerImage, description;

    for (i = 0; i < data.photos.photo.length; i++) {
        photo = data.photos.photo[i];

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
        markers.push(marker);

        // add an event listener for this marker
        bindInfoWindow(map, marker);
    }

    var zoom = site_options['max_zoom'];
    var size = site_options['cluster_size'];
    var style = site_options['cluster_style'];
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

    bindInfoWindow(map, markerClusterer);
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
