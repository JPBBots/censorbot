module.exports = async (client) => {
const https = require('https')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};
getuser = async (tok) => {
    let e = await require('node-fetch')("https://discordapp.com/api/users/@me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tok}`,
        }
    })
return e;
}
app.use(function(req, res, next) {
    console.log(`${req.method} ${req.originalUrl}`)
    next()
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
/* BASIC PREMISE:
app.get('/FRONTEND_REQUESTPOINT' (req, res) => {
  express-stuff-here (https://www.npmjs.com/package/express)
})
*/
var privatekey = fs.readFileSync("./data/ssl/server.key", 'utf8')
var certificate = fs.readFileSync("./data/ssl/server.crt", 'utf8')
var credentials = {key: privatekey, cert: certificate}

var httpsServer = https.createServer(credentials, app)

httpsServer.listen(PORT, () => console.log('server started'));
}
