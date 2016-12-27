#!/usr/bin/env python


client_id = '5f28a7892a3e4f628b653abb60b38b8a'
client_secret = 'fe8219c80453470ab84265802dba7a20'

"""
https://api.instagram.com/oauth/authorize/?client_id=5f28a7892a3e4f628b653abb60b38b8a&redirect_uri=http://example.com&response_type=code
https://api.instagram.com/oauth/authorize/?client_id=5f28a7892a3e4f628b653abb60b38b8a&redirect_uri=http://example.com&response_type=token&scope=public_content


187611995.5f28a78.06c9e9312d384b519badedeb9ae35f64

https://api.instagram.com/v1/media/search?lat=44.6142222&lng=33.518679&distance=5000&access_token=187611995.5f28a78.06c9e9312d384b519badedeb9ae35f64
https://api.instagram.com/v1/locations/search?lat=33.85&lng=44.62&distance=5000&access_token=187611995.5f28a78.06c9e9312d384b519badedeb9ae35f64
https://api.instagram.com/v1/locations/610308475/media/recent?access_token=187611995.5f28a78.06c9e9312d384b519badedeb9ae35f64

,

curl -F 'client_id=5f28a7892a3e4f628b653abb60b38b8a' \
    -F 'client_secret=fe8219c80453470ab84265802dba7a20' \
    -F 'grant_type=authorization_code' \
    -F 'redirect_uri=http://example.com' \
    -F 'code=07bb5c0832eb4ebca37f032ef33d199d' \
    https://api.instagram.com/oauth/access_token


"""