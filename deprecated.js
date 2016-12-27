
var api_key = 'c9f54b3e05dfaaca105f42bd1a1afd01';
var api_secret = '908b08856fead90e';
var fperms = 'read';

if (document.location.hostname == 'localhost') {
    var token = readCookie('flickr_token');
    if (!token) {
        token = prompt('token=');
        if (token) {
            createCookie('flickr_token', token, 1);
        } else {
            throw new Error('no token');
        }
    }
} else {
    var token = auth();
}

function auth() {
    var token = readCookie('flickr_token');
    var frob = URI(document.location.href).search(true)['frob'];

    if (!token && !frob) {
        var fapisig = md5(api_secret + 'api_key' + api_key + 'perms' + fperms + '');
        var url = 'http://flickr.com/services/auth/?api_key=' + api_key + '&perms=' + fperms + '&api_sig=' + fapisig + '';
        document.location.href = url;
        throw new Error("redirecting...");
    } else if (!token) {
        var fmethod = 'flickr.auth.getToken';
        var fapisig = md5(api_secret+'api_key'+api_key+'frob'+frob+'method'+fmethod);
        var url = 'https://api.flickr.com/services/rest/?method=flickr.auth.getToken&api_key='+api_key+'&frob='+frob+'&api_sig='+fapisig;//+'&format=json&nojsoncallback=1';
        $.ajax({
            'method': 'get',
            'url': url,
            'dataType': 'xml',
            'async': false
        }).success(function(response){
            token = $(response).find('token').html();
            createCookie('flickr_token', token, 1);
        });
    }

    return token;
}



var method = 'flickr.photos.search';
// var urlpart = 'lat=33.758754&lon=44.598901&radius=32&format=json&nojsoncallback=1';
// var urlpart = 'format=rest';
var urlpart = '';
var urlpartStripped = urlpart.replace(/=/g, '').replace(/\&/g, '');
//var fapisig = api_secret + 'api_key' + api_key + 'auth_token' + token + 'method' + method;
var fapisig = api_secret + 'api_key' + api_key + 'auth_token' + token + 'method' + method;


console.log(fapisig);
fapisig = md5(fapisig);
var url = 'https://api.flickr.com/services/rest/?method='+method+'&api_key='+api_key+'&'+urlpart;
url += '&auth_token='+token+'&api_sig='+fapisig;
console.log(url);

$.ajax({
    'type': 'get',
    'url': url,
    'format': 'html'
}).success(function(response){
    console.log(response)
});





