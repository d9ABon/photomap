function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    createCookie(name,"",-1);
}
function log(s) {
    $('body').html(s.replace("\n", '<br />'));
}

var api_key = 'c9f54b3e05dfaaca105f42bd1a1afd01';

var url = "https://api.flickr.com/services/rest/";
$.ajax({
    'url': url,
    'data': {
        'format': 'json',
        'nojsoncallback': 1,
        'bbox': decodeURIComponent('33.758754%2C44.598901%2C33.964576%2C44.695992'),
        'accuracy': 1,
        'sort': 'interestingness-desc',
        'extras': 'geo,url_t,url_m',
        'per_page': 50,
        'api_key': api_key,
        'method': 'flickr.photos.search'
    }
}).success(function(data){
    var page = data['page'];
    var pages = data['pages'];
    var perpage = data['perpage'];
    console.log(data);
    $.each(data.photos.photo, function (i, photo) {
        var img = $('<img/>').attr('src', "https://farm"+ photo.farm +".static.flickr.com/"+ photo.server +"/"+ photo.id +"_"+ photo.secret +"_m.jpg");
        $('body').append(img);
    });

});

