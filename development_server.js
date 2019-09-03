const gaze = require('gaze');
const shell = require('shelljs');
const http = require('http');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler')
const request = require('request');
const port = process.env.PORT || 4200

function buildApp() { // gets run anytime the angular code changes
    shell.exec('ng build');
}
function updateLogin() { // gets run anytime the login code or angular code changes.
    shell.exec('cp src/login/* dist');
}

gaze([
    '!srcp/app/login/**/*.{js,html}',
    'src/**/*.{ts,css,html,json,}'
], function(err, watcher) {
    watcher.on('all', function() {
        console.log('\nrebuilding source...\n')
        buildApp();
        updateLogin();
        console.log('\nsource rebuilt!\n')
    })
})
gaze([
    'src/login/**/*.{js,html}'
], function(err, watcher) {
    watcher.on('all', function() {
        updateLogin();
        console.log('\nlogin page copied!\n')
    })
})

const serve = serveStatic('dist', {
    index: ['index.html', 'login.html'],
})

const server = http.createServer(function onRequest(req, res) {
    serve(req, res, finalhandler(req, res))
})

server.listen(port)
console.log('Server started at: ' + port)