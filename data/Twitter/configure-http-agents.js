const http = require('http');
const https = require('https');

const TIMEOUT = 5 * 60 * 1000;

http.globalAgent = new http.Agent({
    timeout: TIMEOUT
});
https.globalAgent = new https.Agent({
    timeout: TIMEOUT
});