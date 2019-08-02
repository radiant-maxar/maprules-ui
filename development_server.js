const gaze = require('gaze');
const shell = require('shelljs');
const http = require('http');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler')
const port = process.env.PORT || 4200

function buildApp() {
    shell.exec('ng build');
}
function updateLogin() {
    shell.exec('cp src/login/* dist');
}

gaze([
    '!srcp/app/login/**/*.{js,html}',
    'src/**/*.{ts,css,html,json,}'
], function(err, watcher) {
    watcher.on('all', function() {
        console.log('rebuilding source...')
        buildApp();
        updateLogin();
        console.log('source rebuilt!')
    })
})
gaze([
    'src/login/**/*.{js,html}'
], function(err, watcher) {
    watcher.on('all', function() {
        updateLogin();
        console.log('login page copied!')
    })
})

const serve = serveStatic('dist', {
    index: ['index.html', 'login.html']
})

const server = http.createServer(function onRequest(req, res) {
    serve(req, res, finalhandler(req, res))
})

server.listen(port)
console.log('Server started at: ' + port)