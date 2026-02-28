const https = require('https');
https.get('https://theqnew.com/faceglow/', (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    res.on('data', (d) => process.stdout.write(d.slice(0, 100)));
}).on('error', (e) => {
    console.error(e);
});
